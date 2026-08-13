import { arrayIncludes } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { DatabaseConnector } from '../../database-connector.js'
import { DatabaseError, DatabaseErrorCode } from '../../database.error.js'
import {
  DATABASE_STATUS_CODES,
  DatabaseStatusCode,
  RedisDatabaseConfig,
  RedisDatabaseConnection,
} from '../../database.js'

/**
 * Options for a Redis database repository.
 *
 * @category none
 */
interface RedisDatabaseRepositoryOptions {
  prefix: string
}

/**
 * Abstract base class for all Redis-based database repositories.
 *
 * All specific repository implementations should extend this class to ensure
 * consistent behavior and reduce code duplication.
 *
 * @category none
 * @internal
 */
export abstract class RedisBaseRepository {
  /** Built repository options. */
  protected readonly options: RedisDatabaseRepositoryOptions

  /** Underlying Redis connection instance. */
  protected readonly connection: RedisDatabaseConnection

  /**
   * Creates a new repository instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   * @param repositoryName - The name of the repository.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config,
    protected readonly logger: Logger,
    protected readonly connector: DatabaseConnector,
    protected readonly repositoryName: string
  ) {
    const conf = this.config.get<RedisDatabaseConfig>('database-config')
    this.options = this.buildOptions(conf)

    this.connection = connector.getConnection<RedisDatabaseConnection>()
  }

  /**
   * Encodes an object to a JSON string.
   *
   * @param obj - The object to encode.
   * @returns The JSON string representation.
   * @throws DatabaseError If encoding fails.
   */
  protected encodeJson(obj: object): string {
    try {
      return JSON.stringify(obj)
    } catch (error) {
      throw DatabaseError.internalError(`Encode JSON failed`, null, error)
    }
  }

  /**
   * Decodes a JSON string to an object.
   *
   * @param str - The JSON string to decode.
   * @returns The decoded object.
   * @throws DatabaseError If decoding fails.
   */
  protected decodeJson(str: string): unknown {
    try {
      return JSON.parse(str)
    } catch (error) {
      throw DatabaseError.internalError(`Decode JSON failed`, null, error)
    }
  }

  /**
   * Encodes a Buffer to a Base64 string.
   *
   * @param buf - The Buffer to encode.
   * @returns The Base64 string representation.
   * @throws DatabaseError If encoding fails.
   */
  protected encodeBase64(buf: Buffer): string {
    try {
      return buf.toString('base64')
    } catch (error) {
      throw DatabaseError.internalError(`Encode Base64 failed`, null, error)
    }
  }

  /**
   * Decodes a Base64 string to a Buffer.
   *
   * @param str - The Base64 string to decode.
   * @returns The decoded Buffer.
   * @throws DatabaseError If decoding fails.
   */
  protected decodeBase64(str: string): Buffer {
    try {
      return Buffer.from(str, 'base64')
    } catch (error) {
      throw DatabaseError.internalError(`Decode Base64 failed`, null, error)
    }
  }

  /**
   * Checks a status reply from a Redis Function and returns its result.
   *
   * This method validates that the reply has a status code of 'OK'.
   *
   * @param value - The status reply from a Redis Function.
   * @throws DatabaseError If the reply is invalid or has a non-OK status code.
   */
  protected checkStatusReply(value: unknown) {
    const [code, message] = this.parseStatusReply(value)

    if (code !== 'OK') {
      throw new DatabaseError(message, {
        context: {
          result: [code, message],
        },
        code,
      })
    }
  }

  /**
   * Checks a status replies from a Redis Functions and returns its result.
   *
   * This method validates that all the replies has a status code of 'OK'.
   *
   * @param values - The status replies from a Redis Functions.
   * @throws DatabaseError If the replies are invalid or has a non-OK status code.
   */
  protected checkStatusReplies(values: unknown[]) {
    if (values.length === 0) {
      throw DatabaseError.internalError(`Empty status reply`)
    }

    const result = values.map((value) => this.parseStatusReply(value))
    const failed = result.find(([code]) => code !== 'OK')

    if (failed) {
      const [code, message] = failed as [DatabaseErrorCode, string]

      throw new DatabaseError(message, {
        context: {
          result,
        },
        code,
      })
    }
  }

  /**
   * Asserts that a reply from a Redis Function is a non-empty string.
   *
   * @param value - The reply from a Redis Function.
   * @throws DatabaseError If validation fails.
   */
  protected validateStringReply(value: unknown): asserts value is string {
    this.validateReply<string>('database-string-reply', value)
  }

  /**
   * Asserts that a reply from a Redis Function is an array of any type.
   *
   * @param value - The reply from a Redis Function.
   * @throws DatabaseError If validation fails.
   */
  protected validateArrayReply(value: unknown): asserts value is unknown[] {
    this.validateReply<unknown[]>('database-array-reply', value)
  }

  /**
   * Asserts that a reply from a Redis Function is an array of non-empty strings.
   *
   * @param value - The reply from a Redis Function.
   * @throws DatabaseError If validation fails.
   */
  protected validateArrayStringsReply(value: unknown): asserts value is string[] {
    this.validateReply<string[]>('database-array-strings-reply', value)
  }

  /**
   * Validates a reply from a Redis Function against a registered JSON Schema.
   *
   * @typeParam T - The expected type of the data after validation.
   * @param schemaName - The name of the schema to validate against.
   * @param value - The reply from a Redis Function.
   * @throws DatabaseError If validation fails.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  protected validateReply<T>(schemaName: string, value: unknown): asserts value is T {
    try {
      this.validator.assertSchema<T>(schemaName, value)
    } catch (error) {
      throw DatabaseError.internalError(`Validate reply failed`, null, error)
    }
  }

  /**
   * Parses a status reply from a Redis Function.
   */
  private parseStatusReply(value: unknown): [DatabaseStatusCode, string] {
    try {
      if (!(typeof value === 'string' && value.length > 0)) {
        throw new Error(`Value is not a non-empty string`)
      }

      const [code, message] = value.split(/\s+(.*)/, 2)

      if (!code || !message) {
        throw new Error(`Value is not parsable to code and message`)
      }

      if (!arrayIncludes(DATABASE_STATUS_CODES, code)) {
        throw new Error(`Status code not known: ${code}`)
      }

      return [code, message]
    } catch (error) {
      throw DatabaseError.internalError(`Parse status reply failed`, null, error)
    }
  }

  /**
   * Converts validated configuration to a repository options.
   */
  private buildOptions(conf: RedisDatabaseConfig): RedisDatabaseRepositoryOptions {
    return {
      prefix: conf.DATABASE_PREFIX,
    }
  }
}

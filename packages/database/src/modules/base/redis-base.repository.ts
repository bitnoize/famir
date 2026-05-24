import { arrayIncludes } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { DatabaseConnector } from '../../database-connector.js'
import { DatabaseError } from '../../database.error.js'
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
    const configData = this.config.get<RedisDatabaseConfig>('database-config')
    this.options = this.buildOptions(configData)

    this.connection = connector.getConnection<RedisDatabaseConnection>()
  }

  /**
   * Encodes an object to a JSON string.
   *
   * @param obj - The object to encode.
   * @returns The JSON string representation.
   * @throws {@link DatabaseError} If encoding fails.
   */
  protected encodeJson(obj: object): string {
    try {
      return JSON.stringify(obj)
    } catch (error) {
      throw new DatabaseError(`Encode JSON failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
        context: {
          //obj
        },
      })
    }
  }

  /**
   * Decodes a JSON string to an object.
   *
   * @param str - The JSON string to decode.
   * @returns The decoded object.
   * @throws {@link DatabaseError} If decoding fails.
   */
  protected decodeJson(str: string): unknown {
    try {
      return JSON.parse(str)
    } catch (error) {
      throw new DatabaseError(`Decode JSON failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
        context: {
          //str
        },
      })
    }
  }

  /**
   * Encodes a Buffer to a Base64 string.
   *
   * @param buf - The Buffer to encode.
   * @returns The Base64 string representation.
   * @throws {@link DatabaseError} If encoding fails.
   */
  protected encodeBase64(buf: Buffer): string {
    try {
      return buf.toString('base64')
    } catch (error) {
      throw new DatabaseError(`Encode Base64 failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
        context: {
          //buf
        },
      })
    }
  }

  /**
   * Decodes a Base64 string to a Buffer.
   *
   * @param str - The Base64 string to decode.
   * @returns The decoded Buffer.
   * @throws {@link DatabaseError} If decoding fails.
   */
  protected decodeBase64(str: string): Buffer {
    try {
      return Buffer.from(str, 'base64')
    } catch (error) {
      throw new DatabaseError(`Decode Base64 failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
        context: {
          //str
        },
      })
    }
  }

  /**
   * Checks a status reply from a Redis Function and returns its message.
   *
   * This method validates that the reply has a status code of 'OK'.
   *
   * @param value - The status reply from a Redis Function.
   * @returns The message part from the status reply.
   * @throws {@link DatabaseError} If the reply is invalid or has a non-OK status code.
   */
  protected checkStatusReply(value: unknown): string {
    const [code, mesg] = this.parseStatusReply(value)

    if (code !== 'OK') {
      throw new DatabaseError(mesg, { code })
    }

    return mesg
  }

  /**
   * Parses a status reply from a Redis Function.
   *
   * The expected format is a string containing a status code and a message.
   *
   * @param value - The status reply from a Redis Function.
   * @returns A tuple containing the status code and message.
   * @throws {@link DatabaseError} If the reply is invalid or cannot be parsed.
   */
  private parseStatusReply(value: unknown): [DatabaseStatusCode, string] {
    try {
      if (!(typeof value === 'string' && value.length > 0)) {
        throw new Error(`Value is not a non-empty string`)
      }

      const [code, mesg] = value.split(/\s+(.*)/, 2)

      if (!code || !mesg) {
        throw new Error(`Value is not parsable to code and mesg`)
      }

      if (!arrayIncludes(DATABASE_STATUS_CODES, code)) {
        throw new Error(`Status code not known: ${code}`)
      }

      return [code, mesg]
    } catch (error) {
      throw new DatabaseError(`Parse status reply failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
        context: {
          //value,
        },
      })
    }
  }

  /**
   * Asserts that a reply from a Redis Function is a non-empty string.
   *
   * @param value - The reply from a Redis Function.
   * @throws {@link DatabaseError} If validation fails.
   */
  protected validateStringReply(value: unknown): asserts value is string {
    this.validateReply<string>('database-string-reply', value)
  }

  /**
   * Asserts that a reply from a Redis Function is an array of any type.
   *
   * @param value - The reply from a Redis Function.
   * @throws {@link DatabaseError} If validation fails.
   */
  protected validateArrayReply(value: unknown): asserts value is unknown[] {
    this.validateReply<unknown[]>('database-array-reply', value)
  }

  /**
   * Asserts that a reply from a Redis Function is an array of non-empty strings.
   *
   * @param value - The reply from a Redis Function.
   * @throws {@link DatabaseError} If validation fails.
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
   * @throws {@link DatabaseError} If validation fails.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  protected validateReply<T>(schemaName: string, value: unknown): asserts value is T {
    try {
      this.validator.assertSchema<T>(schemaName, value)
    } catch (error) {
      throw new DatabaseError(`Validate reply failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
        context: {
          //value,
        },
      })
    }
  }

  /**
   * Handles repository operation errors.
   *
   * Re-throws `DatabaseError` instances with additional context, or wraps
   * unknown errors into a `DatabaseError` with an `INTERNAL_ERROR` code.
   *
   * @param error - The caught error.
   * @param method - The name of the method where the error occurred.
   * @param params - The parameters that were being processed.
   * @returns Never returns, always throws.
   */
  protected handleRepositoryError(error: unknown, method: string, params: unknown): never {
    if (error instanceof DatabaseError) {
      error.context['repository'] = this.repositoryName
      error.context['method'] = method
      error.context['params'] = params

      throw error
    } else {
      throw new DatabaseError(`Unknown error`, {
        cause: error,
        context: {
          repository: this.repositoryName,
          method,
          params,
        },
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * Converts validated configuration to a repository options.
   *
   * @param data - The validated configuration object.
   * @returns The repository options object.
   */
  private buildOptions(data: RedisDatabaseConfig): RedisDatabaseRepositoryOptions {
    return {
      prefix: data.DATABASE_PREFIX,
    }
  }
}

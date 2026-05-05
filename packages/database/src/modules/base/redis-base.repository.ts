import { arrayIncludes } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { DatabaseError } from '../../database.error.js'
import {
  DATABASE_STATUS_CODES,
  DatabaseConnector,
  DatabaseStatusCode,
  RedisDatabaseConfig,
  RedisDatabaseConnection,
  RedisDatabaseRepositoryOptions,
} from '../../database.js'

/**
 * Abstract base class for all Redis-based repositories.
 *
 * @category none
 */
export abstract class RedisBaseRepository {
  /** Builded repository options */
  protected readonly options: RedisDatabaseRepositoryOptions
  /** Underlying Redis connection instance */
  protected readonly connection: RedisDatabaseConnection

  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config<RedisDatabaseConfig>,
    protected readonly logger: Logger,
    protected readonly connector: DatabaseConnector,
    protected readonly repositoryName: string
  ) {
    this.options = this.buildOptions(config.data)

    this.connection = connector.getConnection<RedisDatabaseConnection>()
  }

  /**
   * Encodes an object to a JSON string.
   *
   * @param obj - The object to encode
   * @returns The encoded JSON string
   * @throws {@link DatabaseError} If encoding fails
   */
  protected encodeJson(obj: object): string {
    try {
      return JSON.stringify(obj)
    } catch (error) {
      throw new DatabaseError(`Encode JSON failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * Decodes a JSON string to an object.
   *
   * @param str - The JSON string to decode
   * @returns The decoded object
   * @throws {@link DatabaseError} If decoding fails
   */
  protected decodeJson(str: string): unknown {
    try {
      return JSON.parse(str)
    } catch (error) {
      throw new DatabaseError(`Decode JSON failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * Encodes a Buffer to a Base64 string.
   *
   * @param buf - The Buffer to encode
   * @returns The encoded Base64 string
   * @throws {@link DatabaseError} If encoding fails
   */
  protected encodeBase64(buf: Buffer): string {
    try {
      return buf.toString('base64')
    } catch (error) {
      throw new DatabaseError(`Encode Base64 failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * Decodes a Base64 string to a Buffer.
   *
   * @param str - The Base64 string to decode
   * @returns The decoded Buffer
   * @throws {@link DatabaseError} If decoding fails
   */
  protected decodeBase64(str: string): Buffer {
    try {
      return Buffer.from(str, 'base64')
    } catch (error) {
      throw new DatabaseError(`Decode Base64 failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * Asserts that a Redis reply is a non-empty string.
   *
   * @param value - The value to check
   * @throws {@link DatabaseError} If validation fails
   */
  protected validateStringReply(value: unknown): asserts value is string {
    try {
      if (!(typeof value === 'string' && value.length > 0)) {
        throw new Error(`Value is not a non-empty string`)
      }
    } catch (error) {
      throw new DatabaseError(`Validate string reply failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * Asserts that a Redis reply is an array (of any type).
   *
   * @param value - The value to check
   * @throws {@link DatabaseError} If validation fails
   */
  protected validateArrayReply(value: unknown): asserts value is unknown[] {
    try {
      if (!(typeof value === 'object' && value != null && Array.isArray(value))) {
        throw new Error(`Value is not an array`)
      }
    } catch (error) {
      throw new DatabaseError(`Validate array reply failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * Asserts that a Redis reply is an array of non-empty strings.
   *
   * @param value - The value to check
   * @throws {@link DatabaseError} If validation fails
   */
  protected validateArrayStringsReply(value: unknown): asserts value is string[] {
    try {
      if (!(typeof value === 'object' && value != null && Array.isArray(value))) {
        throw new Error(`Value is not an array`)
      }

      if (!value.every((val) => typeof val === 'string' && val.length > 0)) {
        throw new Error(`Value is not an array of non-empty strings`)
      }
    } catch (error) {
      throw new DatabaseError(`Validate array-strings reply failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * Parse a status reply from a Redis function.
   *
   * @param value - The status reply from Redis
   * @returns The array contains code and mesg
   * @throws {@link DatabaseError} If the reply is invalid
   */
  protected parseStatusReply(value: unknown): [DatabaseStatusCode, string] {
    try {
      if (!(typeof value === 'string' && value.length > 0)) {
        throw new Error(`Value is not a non-empty string`)
      }

      const [code, mesg] = value.split(/\s+(.*)/, 2)

      if (!(code && mesg)) {
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
      })
    }
  }

  /**
   * Validates raw data from Redis against a named JSON schema.
   *
   * @template T - The expected TypeScript type of the data
   * @param schema - The name of the schema
   * @param value - The data to validate
   * @throws {@link DatabaseError} If validation fails
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  protected validateRawData<T>(schema: string, value: unknown): asserts value is T {
    try {
      this.validator.assertSchema<T>(schema, value)
    } catch (error) {
      throw new DatabaseError(`Validate raw-data failed`, {
        cause: error,
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * Centralized error handler for repository methods.
   *
   * Wraps any error in a `DatabaseError` and adds context.
   *
   * @param error - The caught error
   * @param method - The name of the method where the error occurred
   * @param data - The data that was being processed
   * @returns Never returns, always throws
   */
  protected raiseError(error: unknown, method: string, params: unknown): never {
    if (error instanceof DatabaseError) {
      error.context['repository'] = this.repositoryName
      error.context['method'] = method
      error.context['params'] = params

      throw error
    } else {
      throw new DatabaseError(`Service internal error`, {
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
   * Converts a database config to a repository options.
   *
   * @param config - The database config
   * @returns A repository options object
   * @internal
   */
  private buildOptions(config: RedisDatabaseConfig): RedisDatabaseRepositoryOptions {
    return {
      prefix: config.DATABASE_PREFIX,
    }
  }
}

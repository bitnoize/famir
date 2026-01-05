import { arrayIncludes } from '@famir/common'
import { Config, DATABASE_STATUS_CODES, DatabaseError, Logger, Validator } from '@famir/domain'
import { DatabaseConfig, DatabaseRepositoryOptions } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'

export abstract class RedisBaseRepository {
  protected readonly options: DatabaseRepositoryOptions

  constructor(
    protected readonly validator: Validator,
    config: Config<DatabaseConfig>,
    protected readonly logger: Logger,
    protected readonly connection: RedisDatabaseConnection,
    protected readonly repositoryName: string
  ) {
    this.options = this.buildOptions(config.data)
  }

  protected validateStringReply(value: unknown): asserts value is string {
    if (!(value != null && typeof value === 'string' && value)) {
      throw new DatabaseError(`StringReply validate failed`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected validateArrayReply(value: unknown): asserts value is unknown[] {
    if (!(value != null && Array.isArray(value))) {
      throw new DatabaseError(`ArrayReply validate failed`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected validateArrayStringsReply(value: unknown): asserts value is string[] {
    const isValid =
      value != null &&
      Array.isArray(value) &&
      value.every((item) => item != null && typeof item === 'string' && item)

    if (!isValid) {
      throw new DatabaseError(`ArrayStringsReply validate failed`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected handleStatusReply(value: unknown): string {
    if (!(value != null && typeof value === 'string' && value)) {
      throw new DatabaseError(`StatusReply validate failed`, {
        code: 'INTERNAL_ERROR'
      })
    }

    const [code, message] = value.split(/\s+(.*)/, 2)

    if (!(code && message && arrayIncludes(DATABASE_STATUS_CODES, code))) {
      throw new DatabaseError(`StatusReply parse failed`, {
        code: 'INTERNAL_ERROR'
      })
    }

    if (code !== 'OK') {
      throw new DatabaseError(message, {
        code
      })
    }

    return message
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  protected validateRawData<T>(schema: string, value: unknown): asserts value is T {
    try {
      this.validator.assertSchema<T>(schema, value)
    } catch (error) {
      throw new DatabaseError(`RawData validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected decodeJson(value: string): unknown {
    try {
      return JSON.parse(value)
    } catch (error) {
      throw new DatabaseError(`JSON decode failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected encodeJson(value: object): string {
    try {
      return JSON.stringify(value)
    } catch (error) {
      throw new DatabaseError(`JSON encode failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected decodeBase64(value: string): Buffer {
    try {
      return Buffer.from(value, 'base64')
    } catch (error) {
      throw new DatabaseError(`Base64 decode failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected encodeBase64(value: Buffer): string {
    try {
      return value.toString('base64')
    } catch (error) {
      throw new DatabaseError(`Base64 encode failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected raiseError(error: unknown, method: string, data: unknown): never {
    if (error instanceof DatabaseError) {
      error.context['repository'] = this.repositoryName
      error.context['method'] = method
      error.context['data'] = data

      throw error
    } else {
      throw new DatabaseError(`Service unknown error`, {
        cause: error,
        context: {
          repository: this.repositoryName,
          method,
          data
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }

  private buildOptions(config: DatabaseConfig): DatabaseRepositoryOptions {
    return {
      prefix: config.DATABASE_PREFIX
    }
  }
}

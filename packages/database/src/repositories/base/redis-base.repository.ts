import { Config, DatabaseError, Logger, Validator, ValidatorAssertSchema } from '@famir/domain'
import { DatabaseConfig, DatabaseRepositoryOptions } from '../../database.js'
import { buildRepositoryOptions } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'

export abstract class RedisBaseRepository {
  protected readonly assertSchema: ValidatorAssertSchema
  protected readonly options: DatabaseRepositoryOptions

  constructor(
    validator: Validator,
    config: Config<DatabaseConfig>,
    protected readonly logger: Logger,
    protected readonly connection: RedisDatabaseConnection,
    protected readonly repositoryName: string
  ) {
    this.assertSchema = validator.assertSchema

    this.options = buildRepositoryOptions(config.data)
  }

  protected handleException(error: unknown, method: string, data: object | null): never {
    if (error instanceof DatabaseError) {
      error.context['repository'] = this.repositoryName
      error.context['method'] = method
      error.context['data'] = data

      throw error
    } else {
      throw new DatabaseError(`Database internal error`, {
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
}

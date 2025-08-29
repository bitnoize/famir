import { Logger } from '@famir/logger'
import { Validator, ValidatorAssertSchema } from '@famir/validator'
import { DatabaseError } from '../../database.errors.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'

export abstract class RedisBaseRepository {
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly connection: RedisDatabaseConnection,
    protected readonly repositoryName: string
  ) {
    this.assertSchema = validator.assertSchema
  }

  protected exceptionFilter(
    error: unknown,
    method: string,
    params: Record<string, unknown> = {}
  ): never {
    if (error instanceof DatabaseError) {
      error.context['repository'] = this.repositoryName
      error.context['method'] = method
      error.context['params'] = params

      throw error
    } else {
      throw new DatabaseError(
        'INTERNAL_ERROR',
        {
          repository: this.repositoryName,
          method,
          params,
          cause: error
        },
        `Internal database error`
      )
    }
  }
}

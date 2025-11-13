import { DatabaseError, DatabaseErrorCode, Logger, ReplServerError } from '@famir/domain'

export abstract class BaseService {
  constructor(protected readonly logger: Logger) {}

  protected filterDatabaseException(error: unknown, knownErrorCodes: DatabaseErrorCode[]): never {
    if (error instanceof DatabaseError) {
      const isKnownError = knownErrorCodes.includes(error.code)

      if (isKnownError) {
        throw new ReplServerError(error.message, {
          code: error.code
        })
      }
    }

    throw error
  }
}

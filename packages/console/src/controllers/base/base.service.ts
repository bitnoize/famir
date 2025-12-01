import { DatabaseError, DatabaseErrorCode, ReplServerError } from '@famir/domain'

export abstract class BaseService {
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

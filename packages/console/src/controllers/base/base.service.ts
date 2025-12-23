import { DatabaseError, DatabaseErrorCode, ReplServerError } from '@famir/domain'

export abstract class BaseService {
  protected filterDatabaseException(error: unknown, knownErrorCodes: DatabaseErrorCode[]) {
    if (error instanceof DatabaseError) {
      if (knownErrorCodes.includes(error.code)) {
        throw new ReplServerError(error.message, {
          code: error.code
        })
      }
    }
  }
}

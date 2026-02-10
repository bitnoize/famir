import { DatabaseError, DatabaseErrorCode, HttpServerError } from '@famir/domain'

export abstract class BaseService {
  protected simpleDatabaseException(error: unknown, knownErrorCodes: DatabaseErrorCode[]) {
    if (error instanceof DatabaseError) {
      if (knownErrorCodes.includes(error.code)) {
        throw new HttpServerError(error.message, {
          cause: error,
          code: error.code
        })
      }
    }
  }
}

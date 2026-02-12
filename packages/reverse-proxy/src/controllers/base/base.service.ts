import { DatabaseError, DatabaseErrorCode } from '@famir/database'
import { HttpServerError } from '@famir/http-server'

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

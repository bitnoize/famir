import { DatabaseError, DatabaseErrorCode } from '@famir/database'
import { ReplServerError } from '@famir/repl-server'

export abstract class BaseService {
  protected simpleDatabaseException(error: unknown, knownErrorCodes: DatabaseErrorCode[]) {
    if (error instanceof DatabaseError) {
      if (knownErrorCodes.includes(error.code)) {
        throw new ReplServerError(error.message, {
          code: error.code
        })
      }
    }
  }
}

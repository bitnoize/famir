import {
  DatabaseError,
  DatabaseErrorCode,
  ReplServerError,
  WorkflowError,
  WorkflowErrorCode
} from '@famir/domain'

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

  protected filterWorkflowException(error: unknown, knownErrorCodes: WorkflowErrorCode[]): never {
    if (error instanceof WorkflowError) {
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

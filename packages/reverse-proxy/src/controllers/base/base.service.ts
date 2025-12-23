import {
  DatabaseError,
  DatabaseErrorCode,
  HttpClientError,
  HttpClientErrorCode,
  HttpServerError
} from '@famir/domain'

export abstract class BaseService {
  protected filterDatabaseException(error: unknown, knownErrorCodes: DatabaseErrorCode[]) {
    if (error instanceof DatabaseError) {
      if (knownErrorCodes.includes(error.code)) {
        throw new HttpServerError(error.message, {
          cause: error,
          code: error.code
        })
      }
    }
  }

  protected filterHttpClientException(error: unknown, knownErrorCodes: HttpClientErrorCode[]) {
    if (error instanceof HttpClientError) {
      if (knownErrorCodes.includes(error.code)) {
        throw new HttpServerError(error.message, {
          cause: error,
          code: error.code
        })
      }
    }
  }
}

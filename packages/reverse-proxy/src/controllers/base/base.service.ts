import {
  DatabaseError,
  DatabaseErrorCode,
  HttpClientError,
  HttpClientErrorCode,
  HttpServerError
} from '@famir/domain'

export abstract class BaseService {
  protected filterDatabaseException(error: unknown, knownErrorCodes: DatabaseErrorCode[]): never {
    if (error instanceof DatabaseError) {
      const isKnownError = knownErrorCodes.includes(error.code)

      if (isKnownError) {
        throw new HttpServerError(error.message, {
          code: error.code
        })
      }
    }

    throw error
  }

  protected filterHttpClientException(
    error: unknown,
    knownErrorCodes: HttpClientErrorCode[]
  ): never {
    if (error instanceof HttpClientError) {
      const isKnownError = knownErrorCodes.includes(error.code)

      if (isKnownError) {
        throw new HttpServerError(error.message, {
          code: error.code
        })
      }
    }

    throw error
  }
}

import { CommonError, CommonErrorOptions } from '@famir/common'

export type HttpClientErrorCode = 'INTERNAL_ERROR'

export type HttpClientErrorOptions = CommonErrorOptions & {
  code: HttpClientErrorCode
}

export class HttpClientError extends CommonError {
  code: HttpClientErrorCode

  constructor(message: string, options: HttpClientErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context
    })

    this.name = 'HttpClientError'
    this.code = options.code
  }
}

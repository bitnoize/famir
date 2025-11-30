import { DomainError, DomainErrorOptions } from '../../domain.error.js'

export type HttpClientErrorCode = 'INTERNAL_ERROR' | 'GATEWAY_TIMEOUT' | 'BAD_GATEWAY'

export type HttpClientErrorOptions = DomainErrorOptions & {
  code: HttpClientErrorCode
}

export class HttpClientError extends DomainError {
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

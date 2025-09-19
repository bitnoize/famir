import { DomainError, DomainErrorOptions } from '../../domain.error.js'

export type HttpServerErrorCode = 'NOT_FOUND' | 'CONFLICT' | 'FORBIDDEN' | 'UNKNOWN'

export type HttpServerErrorOptions = DomainErrorOptions & {
  code: HttpServerErrorCode
  status: number
}

export class HttpServerError extends DomainError {
  code: HttpServerErrorCode
  status: number

  constructor(message: string, options: HttpServerErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context
    })

    this.name = 'HttpServerError'
    this.code = options.code
    this.status = options.status
  }
}

import { DomainError, DomainErrorOptions } from '../../domain.error.js'

export type HttpServerErrorCode =
  | 'BAD_REQUEST'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'CONTENT_TOO_LARGE'
  | 'UNPROCESSABLE_CONTENT'
  | 'INTERNAL_ERROR'
  | 'BAD_GATEWAY'
  | 'SERVICE_UNAVAILABLE'

export type HttpServerErrorOptions = DomainErrorOptions & {
  code: HttpServerErrorCode
}

const codeToStatusMap = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  CONTENT_TOO_LARGE: 413,
  UNPROCESSABLE_CONTENT: 422,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const

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

    this.status = codeToStatusMap[this.code]
  }
}

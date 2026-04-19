import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * HTTP server error code
 * @category none
 */
export type HttpServerErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'CONTENT_TOO_LARGE'
  | 'UNPROCESSABLE_CONTENT'
  | 'INTERNAL_ERROR'
  | 'BAD_GATEWAY'
  | 'SERVICE_UNAVAILABLE'
  | 'GATEWAY_TIMEOUT'

/**
 * HTTP server error options
 * @category none
 */
export type HttpServerErrorOptions = CommonErrorOptions & {
  code: HttpServerErrorCode
}

const codeToStatusMap: Record<HttpServerErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  CONTENT_TOO_LARGE: 413,
  UNPROCESSABLE_CONTENT: 422,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const

/**
 * Represents HTTP server error
 * @category none
 */
export class HttpServerError extends CommonError {
  code: HttpServerErrorCode
  status: number

  constructor(message: string, options: HttpServerErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context,
    })

    this.name = 'HttpServerError'
    this.code = options.code

    this.status = codeToStatusMap[this.code]
  }
}

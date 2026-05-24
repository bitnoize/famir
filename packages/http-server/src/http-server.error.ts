import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * Error codes that can be returned by the http-server.
 *
 * These codes provide a standardized way to categorize and handle
 * http-server-related errors in the application.
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
 * Options for creating an http-server error.
 */
export type HttpServerErrorOptions = CommonErrorOptions & {
  code: HttpServerErrorCode
}

/**
 * Mapping of error codes to their corresponding HTTP status codes.
 */
const codeToStatus: Record<HttpServerErrorCode, number> = {
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
 * Error class for http-server operation failures.
 */
export class HttpServerError extends CommonError {
  /** Associated error code. */
  readonly code: HttpServerErrorCode

  /** Associated HTTP status code. */
  readonly status: number

  /**
   * Creates a new http-server error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options, including the error code.
   */
  constructor(message: string, options: HttpServerErrorOptions) {
    super(message, options)

    this.name = 'HttpServerError'
    this.code = options.code

    this.status = codeToStatus[this.code]
  }
}

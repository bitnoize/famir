import { CommonError, CommonErrorOptions, ErrorContext } from '@famir/common'

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

  /**
   * Creates a new http-server error with `BAD_REQUEST` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static badRequest(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): HttpServerError {
    return new HttpServerError(message, {
      cause,
      context,
      code: 'BAD_REQUEST',
    })
  }

  /**
   * Creates a new http-server error with `UNAUTHORIZED` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static unauthorized(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): HttpServerError {
    return new HttpServerError(message, {
      cause,
      context,
      code: 'UNAUTHORIZED',
    })
  }

  /**
   * Creates a new http-server error with `FORBIDDEN` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static forbidden(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): HttpServerError {
    return new HttpServerError(message, {
      cause,
      context,
      code: 'FORBIDDEN',
    })
  }

  /**
   * Creates a new http-server error with `NOT_FOUND` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static notFound(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): HttpServerError {
    return new HttpServerError(message, {
      cause,
      context,
      code: 'NOT_FOUND',
    })
  }

  /**
   * Creates a new http-server error with `CONTENT_TOO_LARGE` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static contentTooLarge(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): HttpServerError {
    return new HttpServerError(message, {
      cause,
      context,
      code: 'CONTENT_TOO_LARGE',
    })
  }

  /**
   * Creates a new http-server error with `INTERNAL_ERROR` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static internal(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): HttpServerError {
    return new HttpServerError(message, {
      cause,
      context,
      code: 'INTERNAL_ERROR',
    })
  }

  /**
   * Creates a new http-server error with `BAD_GATEWAY` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static badGateway(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): HttpServerError {
    return new HttpServerError(message, {
      cause,
      context,
      code: 'BAD_GATEWAY',
    })
  }

  /**
   * Creates a new http-server error with `SERVICE_UNAVAILABLE` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static serviceUnavailable(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): HttpServerError {
    return new HttpServerError(message, {
      cause,
      context,
      code: 'SERVICE_UNAVAILABLE',
    })
  }

  /**
   * Creates a new http-server error with `GATEWAY_TIMEOUT` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static gatewayTimeout(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): HttpServerError {
    return new HttpServerError(message, {
      cause,
      context,
      code: 'GATEWAY_TIMEOUT',
    })
  }

  /**
   * Re-throws `HttpServerError` instances with additional context, or wraps
   * unknown errors into a `HttpServerError` with an `INTERNAL_ERROR` code.
   *
   * @param error - The caught error.
   * @param context - The error context.
   */
  static wrap(error: unknown, context: ErrorContext): HttpServerError {
    if (error instanceof HttpServerError) {
      Object.assign(error.context, context)

      return error
    } else {
      return HttpServerError.internal(`Unknown error`, context, error)
    }
  }
}

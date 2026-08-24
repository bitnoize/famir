import { CommonError, CommonErrorOptions, ErrorContext } from '@famir/common'

/**
 * Error codes that can be returned by the http-client.
 *
 * These codes provide a standardized way to categorize and handle
 * http-client-related errors in the application.
 */
export type HttpClientErrorCode = 'BAD_GATEWAY' | 'GATEWAY_TIMEOUT'

/**
 * Options for creating an http-client error.
 */
export type HttpClientErrorOptions = CommonErrorOptions & {
  code: HttpClientErrorCode
}

/**
 * Mapping of error codes to their corresponding HTTP status codes.
 */
const codeToStatus: Record<HttpClientErrorCode, number> = {
  BAD_GATEWAY: 502,
  GATEWAY_TIMEOUT: 504,
} as const

/**
 * Error class for http-client operation failures.
 */
export class HttpClientError extends CommonError {
  /** Associated error code. */
  readonly code: HttpClientErrorCode

  /** Associated HTTP status code. */
  readonly status: number

  /**
   * Creates a new http-client error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options, including the error code.
   */
  constructor(message: string, options: HttpClientErrorOptions) {
    super(message, options)

    this.name = 'HttpClientError'
    this.code = options.code

    this.status = codeToStatus[this.code]
  }

  /**
   * Creates a new http-client error with `BAD_GATEWAY` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static badGateway(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): HttpClientError {
    return new HttpClientError(message, {
      cause,
      context,
      code: 'BAD_GATEWAY',
    })
  }

  /**
   * Creates a new http-client error with `GATEWAY_TIMEOUT` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static gatewayTimeout(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): HttpClientError {
    return new HttpClientError(message, {
      cause,
      context,
      code: 'GATEWAY_TIMEOUT',
    })
  }
}

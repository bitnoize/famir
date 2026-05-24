import { CommonError, CommonErrorOptions } from '@famir/common'

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
  code: HttpClientErrorCode

  /** Associated HTTP status code. */
  status: number

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
}

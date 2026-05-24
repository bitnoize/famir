import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * Error codes that can be returned by the repl-server.
 *
 * These codes provide a standardized way to categorize and handle
 * repl-server-related errors in the application.
 */
export type ReplServerErrorCode =
  'BAD_REQUEST' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL_ERROR'

/**
 * Options for creating a repl-server error.
 */
export type ReplServerErrorOptions = CommonErrorOptions & {
  code: ReplServerErrorCode
}

/**
 * Error class for repl-server operation failures.
 */
export class ReplServerError extends CommonError {
  /** Associated error code. */
  code: ReplServerErrorCode

  /**
   * Creates a new repl-server error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options, including the error code.
   */
  constructor(message: string, options: ReplServerErrorOptions) {
    super(message, options)

    this.name = 'ReplServerError'
    this.code = options.code
  }
}

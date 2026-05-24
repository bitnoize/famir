import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * Error codes that can be returned by the consumer operations.
 *
 * These codes provide a standardized way to categorize and handle
 * consumer-related errors in the application.
 *
 * @category none
 */
export type ConsumerErrorCode = 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_ERROR'

/**
 * Options for creating a consumer error.
 *
 * @category none
 */
export type ConsumerErrorOptions = CommonErrorOptions & {
  code: ConsumerErrorCode
}

/**
 * Error class for consumer operation failures.
 *
 * @category none
 */
export class ConsumerError extends CommonError {
  /** Associated error code. */
  code: ConsumerErrorCode

  /**
   * Creates a new consumer error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options, including the error code.
   */
  constructor(message: string, options: ConsumerErrorOptions) {
    super(message, options)

    this.name = 'ConsumerError'
    this.code = options.code
  }
}

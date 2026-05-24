import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * Error codes that can be returned by the producer operations.
 *
 * These codes provide a standardized way to categorize and handle
 * producer-related errors in the application.
 *
 * @category none
 */
export type ProducerErrorCode = 'INTERNAL_ERROR'

/**
 * Options for creating a producer error.
 *
 * @category none
 */
export type ProducerErrorOptions = CommonErrorOptions & {
  code: ProducerErrorCode
}

/**
 * Error class for producer operation failures.
 *
 * @category none
 */
export class ProducerError extends CommonError {
  /** Associated error code. */
  code: ProducerErrorCode

  /**
   * Creates a new producer error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options, including the error code.
   */
  constructor(message: string, options: ProducerErrorOptions) {
    super(message, options)

    this.name = 'ProducerError'
    this.code = options.code
  }
}

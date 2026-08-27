import { CommonError, CommonErrorOptions, ErrorContext } from '@famir/common'

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

  /**
   * Creates a new producer error with `INTERNAL_ERROR` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static internalError(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): ProducerError {
    return new ProducerError(message, {
      cause,
      context,
      code: 'INTERNAL_ERROR',
    })
  }

  /**
   * Re-throws `ProducerError` instances with additional context, or wraps
   * unknown errors into a `ProducerError` with an `INTERNAL_ERROR` code.
   *
   * @param error - The caught error.
   * @param context - The error context.
   * @returns A new producer instance.
   */
  static wrap(error: unknown, context: ErrorContext): ProducerError {
    if (error instanceof ProducerError) {
      Object.assign(error.context, context)

      return error
    } else {
      return ProducerError.internalError(`Unknown error`, context, error)
    }
  }
}

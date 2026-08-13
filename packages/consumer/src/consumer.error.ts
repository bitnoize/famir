import { CommonError, CommonErrorOptions, ErrorContext } from '@famir/common'

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

  /**
   * Creates a new consumer error with `NOT_FOUND` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static notFound(message: string, context?: ErrorContext | null, cause?: unknown): ConsumerError {
    return new ConsumerError(message, {
      cause,
      context,
      code: 'NOT_FOUND',
    })
  }

  /**
   * Creates a new consumer error with `BAD_REQUEST` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static badRequest(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): ConsumerError {
    return new ConsumerError(message, {
      cause,
      context,
      code: 'BAD_REQUEST',
    })
  }

  /**
   * Creates a new consumer error with `INTERNAL_ERROR` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static internalError(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): ConsumerError {
    return new ConsumerError(message, {
      cause,
      context,
      code: 'INTERNAL_ERROR',
    })
  }

  /**
   * Re-throws `ConsumerError` instances with additional context, or wraps
   * unknown errors into a `ConsumerError` with an `INTERNAL_ERROR` code.
   *
   * @param error - The caught error.
   * @param context - The error context.
   */
  static wrap(error: unknown, context: ErrorContext): ConsumerError {
    if (error instanceof ConsumerError) {
      Object.assign(error.context, context)

      return error
    } else {
      return ConsumerError.internalError(`Unknown error`, context, error)
    }
  }
}

import { CommonError, CommonErrorOptions, ErrorContext } from '@famir/common'

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

  /**
   * Creates a new repl-server error with `BAD_REQUEST` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static badRequest(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): ReplServerError {
    return new ReplServerError(message, {
      cause,
      context,
      code: 'BAD_REQUEST',
    })
  }

  /**
   * Creates a new repl-server error with `FORBIDDEN` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static forbidden(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): ReplServerError {
    return new ReplServerError(message, {
      cause,
      context,
      code: 'FORBIDDEN',
    })
  }

  /**
   * Creates a new repl-server error with `NOT_FOUND` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static notFound(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): ReplServerError {
    return new ReplServerError(message, {
      cause,
      context,
      code: 'NOT_FOUND',
    })
  }

  /**
   * Creates a new repl-server error with `CONFLICT` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static conflict(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): ReplServerError {
    return new ReplServerError(message, {
      cause,
      context,
      code: 'CONFLICT',
    })
  }

  /**
   * Creates a new repl-server error with `INTERNAL_ERROR` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static internal(
    message: string,
    context?: ErrorContext | null,
    cause?: unknown
  ): ReplServerError {
    return new ReplServerError(message, {
      cause,
      context,
      code: 'INTERNAL_ERROR',
    })
  }

  /**
   * Re-throws `ReplServerError` instances with additional context, or wraps
   * unknown errors into a `ReplServerError` with an `INTERNAL_ERROR` code.
   *
   * @param error - The caught error.
   * @param context - The error context.
   * @returns A new repl-server instance.
   */
  static wrap(error: unknown, context: ErrorContext): ReplServerError {
    if (error instanceof ReplServerError) {
      Object.assign(error.context, context)

      return error
    } else {
      return ReplServerError.internal(`Unknown error`, context, error)
    }
  }
}

import { CommonError, CommonErrorOptions, ErrorContext } from '@famir/common'

/**
 * Error class for edge-server operation failures.
 */
export class EdgeServerError extends CommonError {
  /**
   * Creates a new edge-server error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options.
   */
  constructor(message: string, options: CommonErrorOptions) {
    super(message, options)

    this.name = 'EdgeServerError'
  }

  /**
   * Creates a new edge-server error with 'INTERNAL_ERROR' code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static create(message: string, context?: ErrorContext | null, cause?: unknown): EdgeServerError {
    return new EdgeServerError(message, {
      cause,
      context,
    })
  }

  /**
   * Re-throws `EdgeServerError` instances with additional context, or wraps
   * unknown errors into a `EdgeServerError`.
   *
   * @param error - The caught error.
   * @param context - The error context.
   * @returns A new edge-server instance.
   */
  static wrap(error: unknown, context: ErrorContext): EdgeServerError {
    if (error instanceof EdgeServerError) {
      Object.assign(error.context, context)

      return error
    } else {
      return EdgeServerError.create(`Unknown error`, context, error)
    }
  }
}

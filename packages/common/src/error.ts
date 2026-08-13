/**
 * Context object attached to errors for additional diagnostic information.
 */
export type ErrorContext = Record<string, unknown>

/**
 * Options for creating a common error.
 */
export type CommonErrorOptions = ErrorOptions & {
  context?: ErrorContext | null | undefined
}

/**
 * Abstract base class for all application-specific errors.
 */
export abstract class CommonError extends Error {
  /** Additional diagnostic context for the error. */
  readonly context: ErrorContext

  /**
   * Creates a new common error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options.
   */
  constructor(message: string, options: CommonErrorOptions) {
    const parentOptions: ErrorOptions = {}

    if (options.cause) {
      parentOptions.cause = options.cause
    }

    super(message, parentOptions)

    this.context = options.context ?? {}
  }
}

/**
 * Error class for application bootstrap failures.
 */
export class BootstrapError extends CommonError {
  /**
   * Creates a new bootstrap error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options.
   */
  constructor(message: string, options: CommonErrorOptions) {
    super(message, options)

    this.name = 'BootstrapError'
  }

  /**
   * Creates a new bootstrap error.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static create(message: string, context?: ErrorContext | null, cause?: unknown): BootstrapError {
    return new BootstrapError(message, {
      cause,
      context,
    })
  }

  /**
   * Re-throws `BootstrapError` instances with additional context, or wraps
   * unknown errors into a `BootstrapError`.
   *
   * @param error - The caught error.
   * @param context - The error context.
   * @returns A new bootstrap instance.
   */
  static wrap(error: unknown, context: ErrorContext): BootstrapError {
    if (error instanceof BootstrapError) {
      Object.assign(error.context, context)

      return error
    } else {
      return BootstrapError.create(`Unknown error`, context, error)
    }
  }
}

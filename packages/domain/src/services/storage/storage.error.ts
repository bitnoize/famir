import { DomainError, DomainErrorOptions, ErrorContext } from '../../domain.error.js'

/**
 * Error class for storage operation failures.
 *
 * @category Storage Service
 */
export class StorageError extends DomainError {
  /**
   * Creates a new storage error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options.
   */
  constructor(message: string, options: DomainErrorOptions) {
    super(message, options)

    this.name = 'StorageError'
  }

  /**
   * Creates a new storage error with 'INTERNAL_ERROR' code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static create(message: string, context?: ErrorContext | null, cause?: unknown): StorageError {
    return new StorageError(message, {
      cause,
      context,
    })
  }

  /**
   * Re-throws `StorageError` instances with additional context, or wraps
   * unknown errors into a `StorageError`.
   *
   * @param error - The caught error.
   * @param context - The error context.
   * @returns A new storage instance.
   */
  static wrap(error: unknown, context: ErrorContext): StorageError {
    if (error instanceof StorageError) {
      Object.assign(error.context, context)

      return error
    } else {
      return StorageError.create(`Unknown error`, context, error)
    }
  }
}

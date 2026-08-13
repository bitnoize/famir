import { CommonError, CommonErrorOptions, ErrorContext } from '@famir/common'

/**
 * Error codes that can be returned by database operations.
 *
 * These codes provide a standardized way to categorize and handle
 * database-related errors in the application.
 *
 * @category none
 */
export type DatabaseErrorCode = 'NOT_FOUND' | 'CONFLICT' | 'FORBIDDEN' | 'INTERNAL_ERROR'

/**
 * Options for creating a database error.
 *
 * @category none
 */
export type DatabaseErrorOptions = CommonErrorOptions & {
  code: DatabaseErrorCode
}

/**
 * Error class for database operation failures.
 *
 * @category none
 */
export class DatabaseError extends CommonError {
  /** Associated error code. */
  readonly code: DatabaseErrorCode

  /**
   * Creates a new database error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options, including the error code.
   */
  constructor(message: string, options: DatabaseErrorOptions) {
    super(message, options)

    this.name = 'DatabaseError'
    this.code = options.code
  }

  /**
   * Creates a new database error with `NOT_FOUND` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static notFound(message: string, context?: ErrorContext | null, cause?: unknown): DatabaseError {
    return new DatabaseError(message, {
      cause,
      context,
      code: 'NOT_FOUND',
    })
  }

  /**
   * Creates a new database error with `CONFLICT` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static conflict(message: string, context?: ErrorContext | null, cause?: unknown): DatabaseError {
    return new DatabaseError(message, {
      cause,
      context,
      code: 'CONFLICT',
    })
  }

  /**
   * Creates a new database error with `FORBIDDEN` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static forbidden(message: string, context?: ErrorContext | null, cause?: unknown): DatabaseError {
    return new DatabaseError(message, {
      cause,
      context,
      code: 'FORBIDDEN',
    })
  }

  /**
   * Creates a new database error with `INTERNAL_ERROR` code.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static internal(message: string, context?: ErrorContext | null, cause?: unknown): DatabaseError {
    return new DatabaseError(message, {
      cause,
      context,
      code: 'INTERNAL_ERROR',
    })
  }

  /**
   * Re-throws `DatabaseError` instances with additional context, or wraps
   * unknown errors into a `DatabaseError` with an `INTERNAL_ERROR` code.
   *
   * @param error - The caught error.
   * @param context - The error context.
   * @returns A new database instance.
   */
  static wrap(error: unknown, context: ErrorContext): DatabaseError {
    if (error instanceof DatabaseError) {
      Object.assign(error.context, context)

      return error
    } else {
      return DatabaseError.internal(`Unknown error`, context, error)
    }
  }
}

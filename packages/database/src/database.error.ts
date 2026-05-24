import { CommonError, CommonErrorOptions } from '@famir/common'

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
}

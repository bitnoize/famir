import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * Error codes that can be returned by the database.
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
 * Error thrown when database operation fails.
 *
 * @category none
 */
export class DatabaseError extends CommonError {
  /** Describes the type of database error */
  code: DatabaseErrorCode

  /**
   * Creates a new database error instance.
   *
   * @param message - A human-readable description of the error
   * @param options - Error options
   */
  constructor(message: string, options: DatabaseErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context,
    })

    this.name = 'DatabaseError'
    this.code = options.code
  }
}

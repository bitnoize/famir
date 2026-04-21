import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * @category none
 */
export type DatabaseErrorCode = 'NOT_FOUND' | 'CONFLICT' | 'FORBIDDEN' | 'INTERNAL_ERROR'

/**
 * @category none
 */
export type DatabaseErrorOptions = CommonErrorOptions & {
  code: DatabaseErrorCode
}

/**
 * Represents a database error
 *
 * @category none
 */
export class DatabaseError extends CommonError {
  code: DatabaseErrorCode

  constructor(message: string, options: DatabaseErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context,
    })

    this.name = 'DatabaseError'
    this.code = options.code
  }
}

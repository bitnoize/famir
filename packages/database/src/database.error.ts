import { CommonError, CommonErrorOptions } from '@famir/common'

export type DatabaseErrorCode = 'NOT_FOUND' | 'CONFLICT' | 'FORBIDDEN' | 'INTERNAL_ERROR'

export type DatabaseErrorOptions = CommonErrorOptions & {
  code: DatabaseErrorCode
}

export class DatabaseError extends CommonError {
  code: DatabaseErrorCode

  constructor(message: string, options: DatabaseErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context
    })

    this.name = 'DatabaseError'
    this.code = options.code
  }
}

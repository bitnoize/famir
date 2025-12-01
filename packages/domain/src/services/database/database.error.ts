import { DomainError, DomainErrorOptions } from '../../domain.error.js'

export type DatabaseErrorCode =
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'

export type DatabaseErrorOptions = DomainErrorOptions & {
  code: DatabaseErrorCode
}

export class DatabaseError extends DomainError {
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

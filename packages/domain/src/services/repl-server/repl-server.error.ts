import { DomainError, DomainErrorOptions } from '../../domain.error.js'

export type ReplServerErrorCode =
  | 'BAD_REQUEST'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'

export type ReplServerErrorOptions = DomainErrorOptions & {
  code: ReplServerErrorCode
}

export class ReplServerError extends DomainError {
  code: ReplServerErrorCode

  constructor(message: string, options: ReplServerErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context
    })

    this.name = 'ReplServerError'
    this.code = options.code
  }
}

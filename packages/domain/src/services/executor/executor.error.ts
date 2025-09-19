import { DomainError, DomainErrorOptions } from '../../domain.error.js'

export type ExecutorErrorCode = 'UNKNOWN'

export type ExecutorErrorOptions = DomainErrorOptions & {
  code: ExecutorErrorCode
}

export class ExecutorError extends DomainError {
  code: ExecutorErrorCode

  constructor(message: string, options: ExecutorErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context
    })

    this.name = 'ExecutorError'
    this.code = options.code
  }
}

import { DomainError, DomainErrorOptions } from '../../domain.error.js'

export type ExecutorErrorOptions = DomainErrorOptions & {
  code: string
}

export class ExecutorError extends DomainError {
  code: string

  constructor(message: string, options: ExecutorErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context
    })

    this.name = 'ExecutorError'
    this.code = options.code
  }
}

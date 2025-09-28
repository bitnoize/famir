import { DomainError, DomainErrorOptions } from '../../domain.error.js'

export type ReplServerErrorOptions = DomainErrorOptions & {
  code: string
}

export class ReplServerError extends DomainError {
  code: string

  constructor(message: string, options: ReplServerErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context
    })

    this.name = 'ReplServerError'
    this.code = options.code
  }
}

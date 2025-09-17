import { DomainError, ErrorContext } from '../../domain.error.js'

export class ExecutorError extends DomainError {
  constructor(context: ErrorContext, message: string) {
    super(context, message)

    this.name = 'ExecutorError'
  }
}

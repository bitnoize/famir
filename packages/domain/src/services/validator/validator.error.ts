import { DomainError, ErrorContext } from '../../domain.error.js'

export class ValidatorError extends DomainError {
  constructor(context: ErrorContext, message: string) {
    super(context, message)

    this.name = 'ValidatorError'
  }
}

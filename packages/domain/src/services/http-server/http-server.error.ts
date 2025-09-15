import { DomainError, ErrorContext } from '../../domain.error.js'

export class HttpServerError extends DomainError {
  constructor(
    readonly status: number,
    context: ErrorContext,
    message: string
  ) {
    context['status'] = status

    super(context, message)

    this.name = 'HttpServerError'
  }
}

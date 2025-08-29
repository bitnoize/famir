import { CommonError, ErrorContext } from '@famir/common'

export class HttpServerError extends CommonError {
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

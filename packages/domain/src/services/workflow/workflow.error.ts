import { DomainError, DomainErrorOptions } from '../../domain.error.js'

export type WorkflowErrorCode = 'UNKNOWN'

export type WorkflowErrorOptions = DomainErrorOptions & {
  code: WorkflowErrorCode
}

export class WorkflowError extends DomainError {
  code: WorkflowErrorCode

  constructor(message: string, options: WorkflowErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context
    })

    this.name = 'WorkflowError'
    this.code = options.code
  }
}

import { CommonError, CommonErrorOptions } from '@famir/common'

export type WorkflowErrorCode = 'INTERNAL_ERROR'

export type WorkflowErrorOptions = CommonErrorOptions & {
  code: WorkflowErrorCode
}

export class WorkflowError extends CommonError {
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

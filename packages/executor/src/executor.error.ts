import { CommonError, CommonErrorOptions } from '@famir/common'

export type ExecutorErrorCode = 'BAD_REQUEST' | 'UNKNOWN_JOB' | 'INTERNAL_ERROR'

export type ExecutorErrorOptions = CommonErrorOptions & {
  code: ExecutorErrorCode
}

export class ExecutorError extends CommonError {
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

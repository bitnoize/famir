import { CommonError, CommonErrorOptions } from '@famir/common'

export type ReplServerErrorCode =
  | 'BAD_REQUEST'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'

export type ReplServerErrorOptions = CommonErrorOptions & {
  code: ReplServerErrorCode
}

export class ReplServerError extends CommonError {
  code: ReplServerErrorCode

  constructor(message: string, options: ReplServerErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context
    })

    this.name = 'ReplServerError'
    this.code = options.code
  }
}

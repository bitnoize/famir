import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * REPL server error code
 * @category none
 */
export type ReplServerErrorCode =
  | 'BAD_REQUEST'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'

/**
 * REPL server error options
 * @category none
 */
export type ReplServerErrorOptions = CommonErrorOptions & {
  code: ReplServerErrorCode
}

/**
 * Represents REPL server error
 * @category none
 */
export class ReplServerError extends CommonError {
  code: ReplServerErrorCode

  constructor(message: string, options: ReplServerErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context,
    })

    this.name = 'ReplServerError'
    this.code = options.code
  }
}

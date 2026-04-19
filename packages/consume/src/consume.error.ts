import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * @category none
 */
export type ConsumeErrorCode = 'BAD_REQUEST' | 'UNKNOWN_JOB' | 'INTERNAL_ERROR'

/**
 * @category none
 */
export type ConsumeErrorOptions = CommonErrorOptions & {
  code: ConsumeErrorCode
}

/**
 * Represents a consume error
 *
 * @category none
 */
export class ConsumeError extends CommonError {
  code: ConsumeErrorCode

  constructor(message: string, options: ConsumeErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context,
    })

    this.name = 'ConsumeError'
    this.code = options.code
  }
}

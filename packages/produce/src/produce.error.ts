import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * Produce error code
 * @category none
 */
export type ProduceErrorCode = 'INTERNAL_ERROR'

/**
 * Produce error options
 * @category none
 */
export type ProduceErrorOptions = CommonErrorOptions & {
  code: ProduceErrorCode
}

/**
 * Represents a produce error
 * @category none
 */
export class ProduceError extends CommonError {
  code: ProduceErrorCode

  constructor(message: string, options: ProduceErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context,
    })

    this.name = 'ProduceError'
    this.code = options.code
  }
}

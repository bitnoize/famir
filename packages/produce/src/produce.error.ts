import { CommonError, CommonErrorOptions } from '@famir/common'

export type ProduceErrorCode = 'INTERNAL_ERROR'

export type ProduceErrorOptions = CommonErrorOptions & {
  code: ProduceErrorCode
}

export class ProduceError extends CommonError {
  code: ProduceErrorCode

  constructor(message: string, options: ProduceErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context
    })

    this.name = 'ProduceError'
    this.code = options.code
  }
}

import { CommonError, CommonErrorOptions } from '@famir/common'

export type StorageErrorCode = 'INTERNAL_ERROR'

export type StorageErrorOptions = CommonErrorOptions & {
  code: StorageErrorCode
}

export class StorageError extends CommonError {
  code: StorageErrorCode

  constructor(message: string, options: StorageErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context
    })

    this.name = 'StorageError'
    this.code = options.code
  }
}

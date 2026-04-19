import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * @category none
 */
export type StorageErrorCode = 'INTERNAL_ERROR'

/**
 * @category none
 */
export type StorageErrorOptions = CommonErrorOptions & {
  code: StorageErrorCode
}

/**
 * Represents storage error
 *
 * @category none
 */
export class StorageError extends CommonError {
  code: StorageErrorCode

  constructor(message: string, options: StorageErrorOptions) {
    super(message, {
      cause: options.cause,
      context: options.context,
    })

    this.name = 'StorageError'
    this.code = options.code
  }
}

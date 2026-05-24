import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * Error class for storage operation failures.
 */
export class StorageError extends CommonError {
  /**
   * Creates a new storage error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options.
   */
  constructor(message: string, options: CommonErrorOptions) {
    super(message, options)

    this.name = 'StorageError'
  }
}

import { CommonError, CommonErrorOptions } from '@famir/common'

/**
 * Error class for templater operation failures.
 */
export class TemplaterError extends CommonError {
  /**
   * Creates a new templater error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options.
   */
  constructor(message: string, options: CommonErrorOptions) {
    super(message, options)

    this.name = 'TemplaterError'
  }
}

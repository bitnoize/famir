import { CommonError, CommonErrorOptions, ErrorContext } from '@famir/common'

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

  /**
   * Creates a new templater error.
   *
   * @param message - The human-readable description of the error.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static create(message: string, context?: ErrorContext | null, cause?: unknown): TemplaterError {
    return new TemplaterError(message, {
      cause,
      context,
    })
  }
}

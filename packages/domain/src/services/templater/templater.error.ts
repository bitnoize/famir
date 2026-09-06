import { DomainError, DomainErrorOptions, ErrorContext } from '../../domain.error.js'

/**
 * Error class for templater operation failures.
 *
 * @category Templater Service
 */
export class TemplaterError extends DomainError {
  /**
   * Creates a new templater error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options.
   */
  constructor(message: string, options: DomainErrorOptions) {
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

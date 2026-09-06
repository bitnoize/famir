import { DomainError, DomainErrorOptions, ErrorContext } from '../../domain.error.js'

/**
 * Options for creating a validator error.
 *
 * @category Validator Service
 */
export type ValidatorErrorOptions = DomainErrorOptions & {
  /** A list of validation errors. */
  validateErrors?: unknown[] | null | undefined
}

/**
 * Error class for validator operation failures.
 *
 * @category Validator Service
 */
export class ValidatorError extends DomainError {
  /** Associated list of validation errors. */
  readonly validateErrors: unknown[]

  /**
   * Creates a new validator error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options including validation errors.
   */
  constructor(message: string, options: ValidatorErrorOptions) {
    super(message, options)

    this.name = 'ValidatorError'
    this.validateErrors = options.validateErrors ?? []
  }

  /**
   * Creates a new validator error.
   *
   * @param message - The human-readable description of the error.
   * @param validateErrors - The optional validation errors.
   * @param context - The optional error context.
   * @param cause - The optional upstream error.
   */
  static create(
    message: string,
    validateErrors?: unknown[] | null,
    context?: ErrorContext | null,
    cause?: unknown
  ): ValidatorError {
    return new ValidatorError(message, {
      cause,
      validateErrors,
      context,
    })
  }
}

/**
 * Context object attached to errors for additional diagnostic information.
 *
 * @category none
 */
export type ErrorContext = Record<string, unknown>

/**
 * Options for creating a CommonError with optional context.
 *
 * @category none
 */
export type CommonErrorOptions = ErrorOptions & {
  context?: ErrorContext | undefined
}

/**
 * Base class for application errors.
 *
 * Provides support for error context and causes, useful for debugging
 * and error chain tracking.
 *
 * @category none
 * @example
 * ```ts
 * class ValidationError extends CommonError {
 *   constructor(message: string, context?: ErrorContext) {
 *     super(message, { context })
 *   }
 * }
 *
 * try {
 *   throw new ValidationError('Invalid input', { field: 'email' })
 * } catch (error) {
 *   console.log(error.context) // { field: 'email' }
 * }
 * ```
 */
export abstract class CommonError extends Error {
  /**
   * Additional diagnostic context for the error.
   */
  context: ErrorContext = {}

  /**
   * Create a new CommonError.
   *
   * @param message - The error message
   * @param options - Error options including context and cause
   */
  constructor(message: string, options: CommonErrorOptions) {
    const parentOptions: ErrorOptions = {}

    if (options.cause) {
      parentOptions.cause = options.cause
    }

    super(message, parentOptions)

    if (options.context) {
      this.context = options.context
    }

    Object.defineProperty(this, 'stack', {
      value: undefined,
      writable: true,
      configurable: true,
    })
  }
}

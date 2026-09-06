/**
 * Context object attached to errors for additional diagnostic information.
 *
 * @category none
 */
export type ErrorContext = Record<string, unknown>

/**
 * Options for creating a common error.
 *
 * @category none
 */
export type DomainErrorOptions = ErrorOptions & {
  context?: ErrorContext | null | undefined
}

/**
 * Abstract base class for all domain-specific errors.
 *
 * @category none
 */
export abstract class DomainError extends Error {
  /** Additional diagnostic context for the error. */
  readonly context: ErrorContext

  /**
   * Creates a new common error instance.
   *
   * @param message - The human-readable description of the error.
   * @param options - The error options.
   */
  constructor(message: string, options: DomainErrorOptions) {
    const parentOptions: ErrorOptions = {}

    if (options.cause) {
      parentOptions.cause = options.cause
    }

    super(message, parentOptions)

    this.context = options.context ?? {}
  }
}

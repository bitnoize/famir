export type ErrorContext = Record<string, unknown>

export type DomainErrorOptions = ErrorOptions & {
  context?: ErrorContext | undefined
}

export abstract class DomainError extends Error {
  context: ErrorContext = {}

  constructor(message: string, options: DomainErrorOptions) {
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
      configurable: true
    })
  }
}

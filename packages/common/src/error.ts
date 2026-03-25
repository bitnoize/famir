export type ErrorContext = Record<string, unknown>

export type CommonErrorOptions = ErrorOptions & {
  context?: ErrorContext | undefined
}

export abstract class CommonError extends Error {
  context: ErrorContext = {}

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
      configurable: true
    })
  }
}

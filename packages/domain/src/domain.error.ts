export type ErrorContext = Record<string, unknown>

export abstract class DomainError extends Error {
  constructor(
    readonly context: ErrorContext,
    message: string
  ) {
    super(message)
  }
}

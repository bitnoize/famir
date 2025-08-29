export class MalformDataError extends Error {
  constructor(
    readonly entry: string,
    readonly data: unknown,
    readonly reason: unknown
  ) {
    super(`Malform data error`)

    this.name = 'MalformDataError'
  }
}

export type ErrorContext = Record<string, unknown>

export abstract class CommonError extends Error {
  constructor(
    readonly context: ErrorContext,
    message: string
  ) {
    super(message)
  }
}

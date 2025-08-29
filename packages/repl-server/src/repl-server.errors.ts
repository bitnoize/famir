import { CommonError, ErrorContext } from '@famir/common'

export const REPL_SERVER_ERROR_CODES = ['INTERNAL_ERROR', 'UNKNOWN_ERROR'] as const

export type ReplServerErrorCode = (typeof REPL_SERVER_ERROR_CODES)[number]

export class ReplServerError extends CommonError {
  constructor(
    readonly code: ReplServerErrorCode,
    context: ErrorContext,
    message: string
  ) {
    context['code'] = code

    super(context, message)

    this.name = 'ReplServerError'
  }
}

import { CommonError, ErrorContext } from '@famir/common'

export const DATABASE_ERROR_CODES = [
  'INTERNAL_ERROR',
  'BAD_PARAMS',
  'NOT_FOUND',
  'EXISTS',
  'NOT_UNIQUE',
  'FROZEN',
  'LOCKED'
] as const

export type DatabaseErrorCode = (typeof DATABASE_ERROR_CODES)[number]

export class DatabaseError extends CommonError {
  constructor(
    readonly code: DatabaseErrorCode,
    context: ErrorContext,
    message: string
  ) {
    context['code'] = code

    super(context, message)

    this.name = 'DatabaseError'
  }
}

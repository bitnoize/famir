import { CommonError, ErrorContext } from '@famir/common'

export class DatabaseError extends CommonError {
  constructor(context: ErrorContext, message: string) {
    super(context, message)

    this.name = 'DatabaseError'
  }
}

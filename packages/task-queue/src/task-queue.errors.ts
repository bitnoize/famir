import { CommonError, ErrorContext } from '@famir/common'

export class TaskQueueError extends CommonError {
  constructor(context: ErrorContext, message: string) {
    super(context, message)

    this.name = 'TaskQueueError'
  }
}

import { CommonError, ErrorContext } from '@famir/common'

export const TASK_QUEUE_ERROR_CODES = [
  'UNKNOWN_ERROR'
] as const

export type TaskQueueErrorCode = (typeof TASK_QUEUE_ERROR_CODES)[number]

export class TaskQueueError extends CommonError {
  constructor(
    readonly code: TaskQueueErrorCode,
    context: ErrorContext,
    message: string
  ) {
    context['code'] = code

    super(context, message)

    this.name = 'TaskQueueError'
  }
}

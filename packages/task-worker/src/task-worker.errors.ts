import { CommonError, ErrorContext } from '@famir/common'

export const TASK_WORKER_ERROR_CODES = ['UNKNOWN_ERROR'] as const

export type TaskWorkerErrorCode = (typeof TASK_WORKER_ERROR_CODES)[number]

export class TaskWorkerError extends CommonError {
  constructor(
    readonly code: TaskWorkerErrorCode,
    context: ErrorContext,
    message: string
  ) {
    context['code'] = code

    super(context, message)

    this.name = 'TaskWorkerError'
  }
}

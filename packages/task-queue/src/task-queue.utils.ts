import { TaskQueueConfig, TaskQueueOptions } from './task-queue.js'

export function buildConnectorOptions(data: TaskQueueConfig): TaskQueueOptions {
  return {
    connectionUrl: data.TASK_QUEUE_CONNECTION_URL
  }
}

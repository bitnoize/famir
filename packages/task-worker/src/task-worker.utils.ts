import { TaskWorkerConfig, TaskWorkerOptions } from './task-worker.js'

export function buildOptions(data: TaskWorkerConfig): TaskWorkerOptions {
  return {
    connectionUrl: data.TASK_WORKER_CONNECTION_URL,
    concurrency: data.TASK_WORKER_CONCURRENCY,
    limiterMax: data.TASK_WORKER_LIMITER_MAX,
    limiterDuration: data.TASK_WORKER_LIMITER_DURATION
  }
}

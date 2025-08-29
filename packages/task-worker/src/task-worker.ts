export interface TaskWorkerConfig {
  TASK_WORKER_CONNECTION_URL: string
  TASK_WORKER_CONCURRENCY: number
  TASK_WORKER_LIMITER_MAX: number
  TASK_WORKER_LIMITER_DURATION: number
}

export interface TaskWorkerOptions {
  connectionUrl: string
  concurrency: number
  limiterMax: number
  limiterDuration: number
}

export interface TaskWorkerConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T
  //connect(): Promise<void>
  close(): Promise<void>
}

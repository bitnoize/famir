export interface ExecutorConfig {
  EXECUTOR_CONNECTION_URL: string
  EXECUTOR_PREFIX: string
  EXECUTOR_CONCURRENCY: number
  EXECUTOR_LIMITER_MAX: number
  EXECUTOR_LIMITER_DURATION: number
}

export interface ExecutorConnectorOptions {
  connectionUrl: string
}

export interface ExecutorWorkerOptions {
  prefix: string
  concurrency: number
  limiterMax: number
  limiterDuration: number
}

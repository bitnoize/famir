export interface BullExecutorConfig {
  EXECUTOR_CONNECTION_URL: string
  EXECUTOR_PREFIX: string
  EXECUTOR_CONCURRENCY: number
  EXECUTOR_LIMITER_MAX: number
  EXECUTOR_LIMITER_DURATION: number
}

export interface RedisExecutorConnectorOptions {
  connectionUrl: string
}

export interface BullExecutorWorkerOptions {
  prefix: string
  concurrency: number
  limiterMax: number
  limiterDuration: number
}

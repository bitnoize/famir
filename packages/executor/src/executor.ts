export type ExecutorProcessor = (data: unknown) => Promise<unknown>

export interface BullExecutorConfig {
  EXECUTOR_CONNECTION_URL: string
  EXECUTOR_PREFIX: string
}

export interface RedisExecutorConnectorOptions {
  connectionUrl: string
}

export interface BullExecutorWorkerOptions {
  prefix: string
}

export interface ExecutorWorkerSpec {
  readonly concurrency: number
  readonly limiterMax: number
  readonly limiterDuration: number
}

export type ExecutorWorkerSpecs = Record<string, ExecutorWorkerSpec>

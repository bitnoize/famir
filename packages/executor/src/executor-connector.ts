import { type Redis } from 'ioredis'

export const EXECUTOR_CONNECTOR = Symbol('ExecutorConnector')

export interface ExecutorConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T
  //connect(): Promise<void>
  close(): Promise<void>
}

export type RedisExecutorConnection = Redis

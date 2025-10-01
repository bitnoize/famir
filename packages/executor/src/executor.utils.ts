import { filterSecrets } from '@famir/common'
import { ValidatorSchemas } from '@famir/domain'
import { ExecutorConfig, ExecutorConnectorOptions, ExecutorWorkerOptions } from './executor.js'

export const internalSchemas: ValidatorSchemas = {}

export function buildConnectorOptions(data: ExecutorConfig): ExecutorConnectorOptions {
  return {
    connectionUrl: data.EXECUTOR_CONNECTION_URL
  }
}

export function buildWorkerOptions(data: ExecutorConfig): ExecutorWorkerOptions {
  return {
    prefix: data.EXECUTOR_PREFIX,
    concurrency: data.EXECUTOR_CONCURRENCY,
    limiterMax: data.EXECUTOR_LIMITER_MAX,
    limiterDuration: data.EXECUTOR_LIMITER_DURATION
  }
}

export function filterOptionsSecrets(data: object) {
  return filterSecrets(data, ['connectionUrl'])
}

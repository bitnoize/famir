import { ExecutorProcessor } from './executor.js'

export type ExecutorRegistryMap = Record<string, Record<string, ExecutorProcessor>>

export interface ExecutorRegistry {
  addProcessor(queueName: string, jobName: string, processor: ExecutorProcessor): void
  getProcessor(queueName: string, jobName: string): ExecutorProcessor
}

export const EXECUTOR_REGISTRY = Symbol('ExecutorRegistry')

import { ExecutorProcessor } from './executor.js'

export type ExecutorRouterMap = Record<string, Record<string, ExecutorProcessor>>

export interface ExecutorRouter {
  addProcessor(queueName: string, jobName: string, processor: ExecutorProcessor): void
  getProcessor(queueName: string, jobName: string): ExecutorProcessor
}

export const EXECUTOR_ROUTER = Symbol('ExecutorRouter')

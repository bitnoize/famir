import { ExecutorProcessor } from './executor.js'

export type ExecutorRouterMap = Record<string, Record<string, ExecutorProcessor>>

export const EXECUTOR_ROUTER = Symbol('ExecutorRouter')

export interface ExecutorRouter {
  addProcessor(queueName: string, jobName: string, processor: ExecutorProcessor): this
  getProcessor(queueName: string, jobName: string): ExecutorProcessor
}

import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { ExecutorError } from './executor.error.js'
import { ExecutorProcessor } from './executor.js'

export const EXECUTOR_ROUTER = Symbol('ExecutorRouter')

export class ExecutorRouter {
  static inject(container: DIContainer, queueNames: string[]) {
    container.registerSingleton<ExecutorRouter>(
      EXECUTOR_ROUTER,
      (c) => new ExecutorRouter(c.resolve<Logger>(LOGGER), queueNames)
    )
  }

  protected readonly map: Record<string, Record<string, ExecutorProcessor>>

  constructor(
    protected readonly logger: Logger,
    protected readonly queueNames: string[]
  ) {
    this.map = Object.fromEntries(queueNames.map((queueName) => [queueName, {}]))
  }

  addProcessor(queueName: string, jobName: string, processor: ExecutorProcessor): this {
    if (!this.map[queueName]) {
      throw new Error(`Queue not known`)
    }

    if (this.map[queueName][jobName]) {
      throw new Error(`Queue processor allready registered`)
    }

    this.map[queueName][jobName] = processor

    return this
  }

  getProcessor(queueName: string, jobName: string): ExecutorProcessor {
    if (!this.map[queueName]) {
      throw new Error(`Queue not known`)
    }

    if (!this.map[queueName][jobName]) {
      throw new ExecutorError(`Queue processor not registered`, {
        code: 'UNKNOWN_JOB'
      })
    }

    return this.map[queueName][jobName]
  }
}

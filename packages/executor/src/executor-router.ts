import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { ExecutorProcessor, ExecutorWorkerSpecs } from './executor.js'

export const EXECUTOR_ROUTER = Symbol('ExecutorRouter')

export class ExecutorRouter {
  static inject(container: DIContainer, specs: ExecutorWorkerSpecs) {
    container.registerSingleton<ExecutorRouter>(
      EXECUTOR_ROUTER,
      (c) => new ExecutorRouter(c.resolve<Logger>(LOGGER), specs)
    )
  }

  protected readonly registry: Record<string, Map<string, ExecutorProcessor>> = {}

  constructor(
    protected readonly logger: Logger,
    public readonly specs: ExecutorWorkerSpecs
  ) {
    Object.keys(this.specs).forEach((queueName) => {
      this.registry[queueName] = new Map<string, ExecutorProcessor>()
    })

    this.logger.debug(`ExecutorRouter initialized`)
  }

  register(queueName: string, jobName: string, processor: ExecutorProcessor) {
    if (!this.registry[queueName]) {
      throw new Error(`Queue not exists: ${queueName}`)
    }

    if (this.registry[queueName].has(jobName)) {
      throw new Error(`Processor already exists: ${queueName} => ${jobName}`)
    }

    this.registry[queueName].set(jobName, processor)

    this.logger.info(`ExecutorRouter register processor: ${queueName} => ${jobName}`)
  }

  resolve(queueName: string, jobName: string): ExecutorProcessor | null {
    if (!this.registry[queueName]) {
      throw new Error(`Queue not exists: ${queueName}`)
    }

    return this.registry[queueName].get(jobName) ?? null
  }

  reset() {
    Object.values(this.registry).forEach((value) => {
      value.clear()
    })
  }
}

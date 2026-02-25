import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { ExecutorProcessor } from './executor.js'

export const EXECUTOR_ROUTER = Symbol('ExecutorRouter')

export class ExecutorRouter {
  static inject(container: DIContainer, queueNames: string[]) {
    container.registerSingleton<ExecutorRouter>(
      EXECUTOR_ROUTER,
      (c) => new ExecutorRouter(c.resolve<Logger>(LOGGER), queueNames)
    )
  }

  protected readonly registry: Record<string, Map<string, ExecutorProcessor>> = {}

  constructor(
    protected readonly logger: Logger,
    queueNames: string[]
  ) {
    queueNames.map((queueName) => {
      this.registry[queueName] = new Map<string, ExecutorProcessor>()
    })

    this.logger.debug(`ExecutorRouter initialized`)
  }

  register(queueName: string, jobName: string, processor: ExecutorProcessor) {
    if (!this.registry[queueName]) {
      throw new Error(`Queue not exists: ${queueName}`)
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
    Object.values(this.registry).forEach((registry) => {
      registry.clear()
    })
  }
}

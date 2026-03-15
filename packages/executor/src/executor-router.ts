import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { ExecutorError } from './executor.error.js'
import { ExecutorProcessor, ExecutorWorkerSpecs } from './executor.js'

export const EXECUTOR_ROUTER = Symbol('ExecutorRouter')

export class ExecutorRouter {
  static inject(container: DIContainer, specs: ExecutorWorkerSpecs) {
    container.registerSingleton<ExecutorRouter>(
      EXECUTOR_ROUTER,
      (c) => new ExecutorRouter(c.resolve<Logger>(LOGGER), specs)
    )
  }

  static resolve(container: DIContainer): ExecutorRouter {
    return container.resolve(EXECUTOR_ROUTER)
  }

  protected readonly queues: Record<string, Map<string, ExecutorProcessor>> = {}
  protected readonly assets = new Map<string, string>()

  constructor(
    protected readonly logger: Logger,
    public readonly specs: ExecutorWorkerSpecs
  ) {
    Object.keys(this.specs).forEach((queueName) => {
      this.queues[queueName] = new Map<string, ExecutorProcessor>()
    })

    this.logger.debug(`ExecutorRouter initialized`)
  }

  #isActive: boolean = false

  get isActive(): boolean {
    return this.#isActive
  }

  activate() {
    this.#isActive = true
  }

  addProcessor(queueName: string, jobName: string, processor: ExecutorProcessor) {
    if (this.isActive) {
      throw new Error(`Router suddenly active`)
    }

    if (!this.queues[queueName]) {
      throw new Error(`Queue not exists: ${queueName}`)
    }

    if (this.queues[queueName].has(jobName)) {
      throw new Error(`Processor already exists: ${queueName} => ${jobName}`)
    }

    this.queues[queueName].set(jobName, processor)

    this.logger.info(`ExecutorRouter add processor: ${queueName} => ${jobName}`)
  }

  getProcessor(queueName: string, jobName: string): ExecutorProcessor {
    if (!this.isActive) {
      throw new ExecutorError(`Router suddenly not active`, {
        code: 'INTERNAL_ERROR'
      })
    }

    if (!this.queues[queueName]) {
      throw new ExecutorError(`Queue not exists`, {
        code: 'UNKNOWN_JOB'
      })
    }

    const processor = this.queues[queueName].get(jobName)

    if (!processor) {
      throw new ExecutorError(`Processor not exists`, {
        code: 'UNKNOWN_JOB'
      })
    }

    return processor
  }

  addAssets(entries: [string, string][]) {
    if (this.isActive) {
      throw new Error(`Router suddenly active`)
    }

    for (const [name, data] of entries) {
      if (this.assets.has(name)) {
        throw new Error(`Asset already exists: ${name}`)
      }

      this.assets.set(name, data)

      this.logger.info(`ExecutorRouter add asset: ${name}`)
    }
  }

  getAsset(name: string): string | undefined {
    if (!this.isActive) {
      throw new ExecutorError(`Router suddenly not active`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return this.assets.get(name)
  }
}

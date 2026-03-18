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
    this.sureNotActive('addProcessor')

    if (!this.queues[queueName]) {
      throw new Error(`Queue not exists: ${queueName}`)
    }

    if (this.queues[queueName].has(jobName)) {
      throw new Error(`Processor already exists: ${queueName} => ${jobName}`)
    }

    this.queues[queueName].set(jobName, processor)

    this.logger.debug(`ExecutorRouter add processor: ${queueName} => ${jobName}`)
  }

  getProcessor(queueName: string, jobName: string): ExecutorProcessor {
    this.sureIsActive('getProcessor')

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
    this.sureNotActive('addAssets')

    for (const [name, data] of entries) {
      if (this.assets.has(name)) {
        throw new Error(`Asset already exists: ${name}`)
      }

      this.assets.set(name, data)

      this.logger.debug(`ExecutorRouter add asset: ${name}`)
    }
  }

  getAsset(name: string): string | undefined {
    this.sureIsActive('getAsset')

    return this.assets.get(name)
  }

  protected sureNotActive(name: string) {
    if (this.isActive) {
      throw new Error(`Router is active on ${name}`)
    }
  }

  protected sureIsActive(name: string) {
    if (!this.isActive) {
      throw new ExecutorError(`Router not active on ${name}`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }
}

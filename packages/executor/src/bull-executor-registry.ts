import { DIContainer } from '@famir/common'
import {
  EXECUTOR_REGISTRY,
  ExecutorError,
  ExecutorProcessor,
  ExecutorRegistry,
  ExecutorRegistryMap,
  Logger,
  LOGGER
} from '@famir/domain'

export class BullExecutorRegistry implements ExecutorRegistry {
  static inject(container: DIContainer, queueNames: string[]) {
    container.registerSingleton<ExecutorRegistry>(
      EXECUTOR_REGISTRY,
      (c) => new BullExecutorRegistry(c.resolve<Logger>(LOGGER), queueNames)
    )
  }

  protected readonly map: ExecutorRegistryMap

  constructor(
    protected readonly logger: Logger,
    protected readonly queueNames: string[]
  ) {
    this.map = Object.fromEntries(queueNames.map((queueName) => [queueName, {}]))

    this.logger.debug(`ExecutorRegistry initialized`, {
      queueNames
    })
  }

  addProcessor(queueName: string, jobName: string, processor: ExecutorProcessor) {
    if (!this.map[queueName]) {
      throw new Error(`Queue not known`)
    }

    if (this.map[queueName][jobName]) {
      throw new Error(`Queue processor allready registered`)
    }

    this.map[queueName][jobName] = processor
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

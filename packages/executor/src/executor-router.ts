import { DIContainer } from '@famir/common'
import {
  EXECUTOR_ROUTER,
  ExecutorError,
  ExecutorProcessor,
  ExecutorRouter,
  ExecutorRouterMap,
  Logger,
  LOGGER
} from '@famir/domain'

export class ImplExecutorRouter implements ExecutorRouter {
  static inject(container: DIContainer, queueNames: string[]) {
    container.registerSingleton<ExecutorRouter>(
      EXECUTOR_ROUTER,
      (c) => new ImplExecutorRouter(c.resolve<Logger>(LOGGER), queueNames)
    )
  }

  protected readonly map: ExecutorRouterMap

  constructor(
    protected readonly logger: Logger,
    protected readonly queueNames: string[]
  ) {
    this.map = Object.fromEntries(queueNames.map((queueName) => [queueName, {}]))
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

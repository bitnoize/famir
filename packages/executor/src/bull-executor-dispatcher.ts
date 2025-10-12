import { DIContainer } from '@famir/common'
import {
  EXECUTOR_DISPATCHER,
  ExecutorDispatcher,
  ExecutorDispatchHandler,
  Logger,
  LOGGER
} from '@famir/domain'
import { Job } from 'bullmq'

export class BullExecutorDispatcher implements ExecutorDispatcher {
  static inject(container: DIContainer) {
    container.registerSingleton<ExecutorDispatcher>(
      EXECUTOR_DISPATCHER,
      (c) => new BullExecutorDispatcher(c.resolve<Logger>(LOGGER))
    )
  }

  private readonly _map = new Map<string, ExecutorDispatchHandler>()

  constructor(protected readonly logger: Logger) {
    this.logger.debug(
      {
        module: 'executor'
      },
      `ExecutorDispatcher initialized`
    )
  }

  async applyTo(job: Job<unknown, unknown>): Promise<unknown> {
    const handler = this._map.get(job.name)

    if (!handler) {
      throw new Error(`Dispatch handler '${job.name}' not exists`)
    }

    return await handler(job.data)
  }

  setHandler(name: string, handler: ExecutorDispatchHandler) {
    if (this._map.has(name)) {
      throw new Error(`Dispatch handler '${name}' allready exists`)
    }

    this._map.set(name, handler)

    this.logger.debug(
      {
        module: 'executor',
        handler: name
      },
      `ExecutorDispatcher register handler`
    )
  }
}

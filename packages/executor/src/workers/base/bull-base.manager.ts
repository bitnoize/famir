import { BaseManager, Logger } from '@famir/domain'
import { Job } from 'bullmq'

export abstract class BullBaseManager<D, R, N extends string> implements BaseManager<D, R, N> {
  protected readonly _map = new Map<N, (data: D) => Promise<R>>()

  constructor(
    protected readonly logger: Logger,
    protected readonly queueName: string
  ) {
    this.logger.debug(
      {
        module: 'executor',
        queue: this.queueName
      },
      `Manager initialized`
    )
  }

  async applyTo(job: Job<D, R, N>): Promise<R> {
    const handler = this._map.get(job.name)

    if (handler === undefined) {
      throw new Error(`Handler '${job.name}' not exists`)
    }

    return await handler(job.data)
  }

  setHandler(name: N, handler: (data: D) => Promise<R>) {
    if (this._map.has(name)) {
      throw new Error(`Handler '${name}' allready exists`)
    }

    this._map.set(name, handler)

    this.logger.debug(
      {
        module: 'executor',
        queue: this.queueName,
        handler: {
          name
        }
      },
      `Manager register handler`
    )
  }
}

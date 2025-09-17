import { Job } from 'bullmq'
import { BaseManager } from './base.js'

export abstract class BullBaseManager<D, R, N extends string> implements BaseManager<D, R, N> {
  protected readonly _map = new Map<N, (data: D) => Promise<R>>()

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
  }
}

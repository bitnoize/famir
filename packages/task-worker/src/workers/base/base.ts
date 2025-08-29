export abstract class BaseDispatcher<D, R, N extends string> {
  protected readonly _map = new Map<N, (data: D) => Promise<R>>()

  setHandler(name: N, value: (data: D) => Promise<R>) {
    if (this._map.has(name)) {
      throw new Error(`Handler '${name}' allready exists`)
    }

    this._map.set(name, value)
  }

  getHandler(name: N): (data: D) => Promise<R> {
    const handler = this._map.get(name)

    if (handler === undefined) {
      throw new Error(`Handler '${name}' not exists`)
    }

    return handler
  }
}

export interface BaseWorker {
  run(): Promise<void>
  close(): Promise<void>
}

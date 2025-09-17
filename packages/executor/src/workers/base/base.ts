export interface BaseManager<D, R, N extends string> {
  applyTo(job: unknown): Promise<R>
  setHandler(name: N, handler: (data: D) => Promise<R>): void
}

export interface BaseWorker {
  run(): Promise<void>
  close(): Promise<void>
}

export interface ExecutorConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T
  //connect(): Promise<void>
  close(): Promise<void>
}

export const EXECUTOR_CONNECTOR = Symbol('ExecutorConnector')

export type ExecutorDispatchHandler = (data: unknown) => Promise<unknown>

export interface ExecutorDispatcher {
  applyTo(job: unknown): Promise<unknown>
  setHandler(name: string, handler: ExecutorDispatchHandler): void
}

export const EXECUTOR_DISPATCHER = Symbol('ExecutorDispatcher')

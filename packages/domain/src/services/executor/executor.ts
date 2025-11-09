export interface ExecutorConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T
  //connect(): Promise<void>
  close(): Promise<void>
}

export const EXECUTOR_CONNECTOR = Symbol('ExecutorConnector')

export type ExecutorProcessor = (data: unknown) => Promise<unknown>



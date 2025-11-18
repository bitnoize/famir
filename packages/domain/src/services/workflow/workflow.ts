export const WORKFLOW_CONNECTOR = Symbol('WorkflowConnector')

export interface WorkflowConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T
  //connect(): Promise<void>
  close(): Promise<void>
}

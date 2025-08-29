export interface TaskQueueConfig {
  TASK_QUEUE_CONNECTION_URL: string
}

export interface TaskQueueOptions {
  connectionUrl: string
}

export interface TaskQueueConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T
  //connect(): Promise<void>
  close(): Promise<void>
}

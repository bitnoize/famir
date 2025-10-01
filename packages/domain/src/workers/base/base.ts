export interface BaseWorker {
  run(): Promise<void>
  close(): Promise<void>
}

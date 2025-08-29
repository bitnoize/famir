export interface BaseQueue {
  close(): Promise<void>
  getTaskCount(): Promise<number>
  getTaskCounts(): Promise<Record<string, number>>
}

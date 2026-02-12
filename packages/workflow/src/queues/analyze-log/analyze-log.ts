export const ANALYZE_LOG_QUEUE_NAME = 'analyze-log'

export interface AnalyzeLogJobData {
  campaignId: string
  messageId: string
}

export type AnalyzeLogJobResult = boolean

export const ANALYZE_LOG_QUEUE = Symbol('AnalyzeLogQueue')

export interface AnalyzeLogQueue {
  close(): Promise<void>
  getJobCount(): Promise<number>
  getJobCounts(): Promise<Record<string, number>>
  addJob(data: AnalyzeLogJobData, name: string): Promise<string>
}

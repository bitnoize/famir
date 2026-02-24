import { AnalyzeLogJobData } from '../../jobs/index.js'

export const ANALYZE_LOG_QUEUE_NAME = 'analyze-log'

export const ANALYZE_LOG_QUEUE = Symbol('AnalyzeLogQueue')

export interface AnalyzeLogQueue {
  close(): Promise<void>
  getJobCount(): Promise<number>
  getJobCounts(): Promise<Record<string, number>>
  addJob(name: string, data: AnalyzeLogJobData): Promise<void>
}

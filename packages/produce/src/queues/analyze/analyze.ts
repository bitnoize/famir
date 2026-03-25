import { AnalyzeJobData } from '../../jobs/index.js'

export const ANALYZE_QUEUE_NAME = 'analyze'

export const ANALYZE_QUEUE = Symbol('AnalyzeQueue')

export interface AnalyzeQueue {
  close(): Promise<void>
  getJobCount(): Promise<number>
  getJobCounts(): Promise<Record<string, number>>
  addJob(name: string, data: AnalyzeJobData): Promise<void>
}

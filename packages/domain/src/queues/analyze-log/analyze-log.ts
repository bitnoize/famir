import { BaseQueue } from '../base/index.js'

export const ANALYZE_LOG_QUEUE_NAME = 'analyze-log'

export interface AnalyzeLogJobData {
  campaignId: string
  messageId: string
}

export type AnalyzeLogJobResult = boolean

export interface AnalyzeLogQueue extends BaseQueue {
  addJob(data: AnalyzeLogJobData, name: string): Promise<string>
}

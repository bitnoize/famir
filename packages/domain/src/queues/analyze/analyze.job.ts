/**
 * Data payload for an analyze job.
 *
 * @category Analyze Queue
 */
export interface AnalyzeJobData {
  campaignId: string
  messageId: string
}

/**
 * Result of an analyze job.
 *
 * @category Analyze Queue
 */
export type AnalyzeJobResult = boolean

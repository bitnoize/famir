/**
 * Data payload for an analyze job.
 *
 * @category Analyze
 */
export interface AnalyzeJobData {
  campaignId: string
  messageId: string
}

/**
 * Result of an analyze job.
 *
 * @category Analyze
 */
export type AnalyzeJobResult = boolean

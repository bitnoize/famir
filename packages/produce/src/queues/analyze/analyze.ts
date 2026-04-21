import { AnalyzeJobData } from '../../jobs/index.js'

/**
 * DI token
 * @category Analyze
 */
export const ANALYZE_QUEUE = Symbol('AnalyzeQueue')

/**
 * @category Analyze
 * @internal
 */
export const ANALYZE_QUEUE_NAME = 'analyze'

/**
 * Represents an analyze queue
 *
 * @category Analyze
 */
export interface AnalyzeQueue {
  /**
   * Close queue
   */
  close(): Promise<void>

  /**
   * Get job cound
   */
  getJobCount(): Promise<number>

  /**
   * Get job counts
   */
  getJobCounts(): Promise<Record<string, number>>

  /**
   * Add job to queue
   */
  addJob(name: string, data: AnalyzeJobData): Promise<void>
}

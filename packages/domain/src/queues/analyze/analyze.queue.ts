import { BaseQueue } from '../base/index.js'
import { AnalyzeJobData } from './analyze.job.js'

/**
 * DI token for an analyze queue implementation.
 *
 * @category Analyze Queue
 */
export const ANALYZE_QUEUE = Symbol('AnalyzeQueue')

/**
 * Analyze queue name.
 *
 * @category Analyze Queue
 */
export const ANALYZE_QUEUE_NAME = 'analyze'

/**
 * Analyze queue name type.
 *
 * @category Analyze Queue
 */
export type AnalyzeQueueName = typeof ANALYZE_QUEUE_NAME

/**
 * Defines the public contract for an analyze queue.
 *
 * This queue is responsible for processing captured messages from a reverse-proxy
 * and performing analysis tasks like parsing, logging, or threat detection.
 *
 * @category Analyze Queue
 */
export interface AnalyzeQueue extends BaseQueue {
  /**
   * Adds a new job to the analyze queue.
   *
   * @param name - The name of the job to be added.
   * @param data - The arbitrary data to append to the job.
   * @throws ProducerError If adding job fails.
   */
  addJob(name: string, data: AnalyzeJobData): Promise<void>
}

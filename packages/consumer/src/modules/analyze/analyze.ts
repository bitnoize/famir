import { BaseWorker } from '../base/index.js'

/**
 * DI token for an analyze worker implementation.
 *
 * @category Analyze
 */
export const ANALYZE_WORKER = Symbol('AnalyzeWorker')

/**
 * Defines the public contract for an analyze worker.
 *
 * @category Analyze
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AnalyzeWorker extends BaseWorker {}

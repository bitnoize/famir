/**
 * @category Analyze
 * @internal
 */
export const ANALYZE_WORKER = Symbol('AnalyzeWorker')

/**
 * Represents an analyze worker
 *
 * @category Analyze
 */
export interface AnalyzeWorker {
  /**
   * Run worker
   */
  run(): Promise<void>

  /**
   * Close worker
   */
  close(): Promise<void>
}

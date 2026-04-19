/**
 * DI token
 * @category DI
 */
export const ANALYZE_WORKER = Symbol('AnalyzeWorker')

/**
 * Represents an analyze worker
 * @category Workers
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

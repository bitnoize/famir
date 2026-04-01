export const ANALYZE_WORKER = Symbol('AnalyzeWorker')

/**
 * Analyze worker contract
 */
export interface AnalyzeWorker {
  run(): Promise<void>
  close(): Promise<void>
}

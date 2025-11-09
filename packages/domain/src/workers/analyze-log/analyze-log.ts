export interface AnalyzeLogWorker {
  run(): Promise<void>
  close(): Promise<void>
}

export const ANALYZE_LOG_WORKER = Symbol('AnalyzeLogWorker')

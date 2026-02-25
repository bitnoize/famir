export const ANALYZE_WORKER = Symbol('AnalyzeWorker')

export interface AnalyzeWorker {
  run(): Promise<void>
  close(): Promise<void>
}

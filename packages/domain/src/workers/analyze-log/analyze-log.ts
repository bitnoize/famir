import { BaseWorker } from '../base/index.js'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AnalyzeLogWorker extends BaseWorker {}

export const ANALYZE_LOG_WORKER = Symbol('AnalyzeLogWorker')

import { BaseWorker } from '../base/index.js'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PersistLogWorker extends BaseWorker {}

export const PERSIST_LOG_WORKER = Symbol('PersistLogWorker')

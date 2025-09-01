import { ScanSessionData, ScanSessionName, ScanSessionResult } from '@famir/task-queue'
import { BaseManager, BaseWorker } from '../base/index.js'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ScanSessionManager
  extends BaseManager<ScanSessionData, ScanSessionResult, ScanSessionName> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ScanSessionWorker extends BaseWorker {}

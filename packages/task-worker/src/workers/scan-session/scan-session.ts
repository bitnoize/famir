import { ScanSessionData, ScanSessionName, ScanSessionResult } from '@famir/task-queue'
import { BaseDispatcher, BaseWorker } from '../base/index.js'

export class ScanSessionDispatcher extends BaseDispatcher<
  ScanSessionData,
  ScanSessionResult,
  ScanSessionName
> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ScanSessionWorker extends BaseWorker {}

import { ScanMessageData, ScanMessageName, ScanMessageResult } from '@famir/task-queue'
import { BaseDispatcher, BaseWorker } from '../base/index.js'

export class ScanMessageDispatcher extends BaseDispatcher<
  ScanMessageData,
  ScanMessageResult,
  ScanMessageName
> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ScanMessageWorker extends BaseWorker {}

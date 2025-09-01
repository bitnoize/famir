import { ScanMessageData, ScanMessageName, ScanMessageResult } from '@famir/task-queue'
import { BaseManager, BaseWorker } from '../base/index.js'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ScanMessageManager
  extends BaseManager<ScanMessageData, ScanMessageResult, ScanMessageName> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ScanMessageWorker extends BaseWorker {}

import { ScanMessageJobData, ScanMessageJobName, ScanMessageJobResult } from '../../jobs/index.js'
import { BaseManager, BaseWorker } from '../base/index.js'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ScanMessageManager
  extends BaseManager<ScanMessageJobData, ScanMessageJobResult, ScanMessageJobName> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ScanMessageWorker extends BaseWorker {}

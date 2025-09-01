import { ScanMessageData, ScanMessageName, ScanMessageResult } from '@famir/task-queue'
import { BullBaseManager } from '../base/index.js'
import { ScanMessageManager } from './scan-message.js'

export class BullScanMessageManager
  extends BullBaseManager<ScanMessageData, ScanMessageResult, ScanMessageName>
  implements ScanMessageManager {}

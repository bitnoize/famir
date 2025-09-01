import { ScanSessionData, ScanSessionName, ScanSessionResult } from '@famir/task-queue'
import { BullBaseManager } from '../base/index.js'
import { ScanSessionManager } from './scan-session.js'

export class BullScanSessionManager
  extends BullBaseManager<ScanSessionData, ScanSessionResult, ScanSessionName>
  implements ScanSessionManager {}

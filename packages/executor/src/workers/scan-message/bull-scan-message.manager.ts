import { ScanMessageJobData, ScanMessageJobName, ScanMessageJobResult } from '@famir/domain'
import { BullBaseManager } from '../base/index.js'
import { ScanMessageManager } from './scan-message.js'

export class BullScanMessageManager
  extends BullBaseManager<ScanMessageJobData, ScanMessageJobResult, ScanMessageJobName>
  implements ScanMessageManager {}

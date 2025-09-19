import {
  Logger,
  SCAN_MESSAGE_QUEUE_NAME,
  ScanMessageJobData,
  ScanMessageJobName,
  ScanMessageJobResult,
  ScanMessageManager
} from '@famir/domain'
import { BullBaseManager } from '../base/index.js'

export class BullScanMessageManager
  extends BullBaseManager<ScanMessageJobData, ScanMessageJobResult, ScanMessageJobName>
  implements ScanMessageManager
{
  constructor(logger: Logger) {
    super(logger, SCAN_MESSAGE_QUEUE_NAME)
  }
}

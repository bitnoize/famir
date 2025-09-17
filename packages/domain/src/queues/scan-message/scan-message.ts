import { BaseQueue } from '../base/index.js'

export const SCAN_MESSAGE_QUEUE_NAME = 'scan-message'

export interface ScanMessageQueue extends BaseQueue {
  addJob(messageId: string): Promise<void>
}

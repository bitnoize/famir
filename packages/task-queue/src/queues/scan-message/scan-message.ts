import { BaseQueue } from '../base/index.js'

export const SCAN_MESSAGE_QUEUE_NAME = 'scan-message'

export interface ScanMessageData {
  messageId: string
}

export type ScanMessageResult = number

export type ScanMessageName = 'default'

export interface ScanMessageQueue extends BaseQueue {
  addTask(messageId: string): Promise<void>
}

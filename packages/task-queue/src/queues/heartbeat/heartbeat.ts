import { BaseQueue } from '../base/index.js'

export const HEARTBEAT_QUEUE_NAME = 'heartbeat'

export type HeartbeatData = null

export type HeartbeatResult = number

export type HeartbeatName = 'scan-sessions' | 'scan-messages'

export interface HeartbeatQueue extends BaseQueue {
  upsertScanSessionsScheduler(every: number): Promise<void>
  removeScanSessionsScheduler(): Promise<void>
  upsertScanMessagesScheduler(every: number): Promise<void>
  removeScanMessagesScheduler(): Promise<void>
}

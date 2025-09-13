import { BaseQueue } from '../base/index.js'

export const SCAN_SESSION_QUEUE_NAME = 'scan-session'

export interface ScanSessionData {
  sessionId: string
}

export type ScanSessionResult = number

export type ScanSessionName = 'default'

export interface ScanSessionQueue extends BaseQueue {
  addDefaultTask(sessionId: string): Promise<void>
}

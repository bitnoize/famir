import { BaseQueue } from '../base/index.js'

export const PERSIST_LOG_QUEUE_NAME = 'persist-log'

export interface PersistLogJobData {
  campaignId: string
  messageId: string
}

export type PersistLogJobResult = boolean

export interface PersistLogQueue extends BaseQueue {
  addJob(data: PersistLogJobData): Promise<string>
}

export const PERSIST_LOG_QUEUE = Symbol('PersistLogQueue')


import { HeartbeatData, HeartbeatName, HeartbeatResult } from '@famir/task-queue'
import { BaseManager, BaseWorker } from '../base/index.js'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HeartbeatManager
  extends BaseManager<HeartbeatData, HeartbeatResult, HeartbeatName> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HeartbeatWorker extends BaseWorker {}

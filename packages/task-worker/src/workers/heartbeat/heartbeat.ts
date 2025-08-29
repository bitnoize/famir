import { HeartbeatData, HeartbeatName, HeartbeatResult } from '@famir/task-queue'
import { BaseDispatcher, BaseWorker } from '../base/index.js'

export class HeartbeatDispatcher extends BaseDispatcher<
  HeartbeatData,
  HeartbeatResult,
  HeartbeatName
> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HeartbeatWorker extends BaseWorker {}

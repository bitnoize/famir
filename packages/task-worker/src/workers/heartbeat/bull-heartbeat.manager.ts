import { HeartbeatData, HeartbeatName, HeartbeatResult } from '@famir/task-queue'
import { BullBaseManager } from '../base/index.js'
import { HeartbeatManager } from './heartbeat.js'

export class BullHeartbeatManager
  extends BullBaseManager<HeartbeatData, HeartbeatResult, HeartbeatName>
  implements HeartbeatManager {}

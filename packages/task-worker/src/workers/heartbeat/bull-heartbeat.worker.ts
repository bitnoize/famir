import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import {
  HEARTBEAT_QUEUE_NAME,
  HeartbeatData,
  HeartbeatName,
  HeartbeatResult
} from '@famir/task-queue'
import { Validator } from '@famir/validator'
import { BullTaskWorkerConnection } from '../../bull-task-worker-connector.js'
import { TaskWorkerConfig } from '../../task-worker.js'
import { BullBaseWorker } from '../base/index.js'
import { HeartbeatDispatcher, HeartbeatWorker } from './heartbeat.js'

export class BullHeartbeatWorker
  extends BullBaseWorker<HeartbeatData, HeartbeatResult, HeartbeatName>
  implements HeartbeatWorker
{
  constructor(
    validator: Validator,
    config: Config<TaskWorkerConfig>,
    logger: Logger,
    connection: BullTaskWorkerConnection,
    dispatcher: HeartbeatDispatcher
  ) {
    super(validator, config, logger, connection, dispatcher, HEARTBEAT_QUEUE_NAME)
  }
}

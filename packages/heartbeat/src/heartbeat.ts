import { DatabaseConfig } from '@famir/database'
import { LoggerConfig } from '@famir/logger'
import { TaskQueueConfig } from '@famir/task-queue'
import { TaskWorkerConfig } from '@famir/task-worker'

export type HeartbeatConfig = LoggerConfig & DatabaseConfig & TaskQueueConfig & TaskWorkerConfig

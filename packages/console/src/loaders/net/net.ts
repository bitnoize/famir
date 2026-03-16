import { RedisDatabaseConfig } from '@famir/database'
import { PinoLoggerConfig } from '@famir/logger'
import { NetReplServerConfig } from '@famir/repl-server'
import { BullWorkflowConfig } from '@famir/workflow'

export type AppNetConfig = PinoLoggerConfig &
  RedisDatabaseConfig &
  BullWorkflowConfig &
  NetReplServerConfig

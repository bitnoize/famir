import { RedisDatabaseConfig } from '@famir/database'
import { PinoLoggerConfig } from '@famir/logger'
import { CliReplServerConfig } from '@famir/repl-server'
import { BullWorkflowConfig } from '@famir/workflow'

export type AppCliConfig = PinoLoggerConfig &
  RedisDatabaseConfig &
  BullWorkflowConfig &
  CliReplServerConfig

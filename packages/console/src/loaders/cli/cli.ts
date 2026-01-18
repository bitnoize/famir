import { RedisDatabaseConfig } from '@famir/database'
import { PinoLoggerConfig } from '@famir/logger'
import { CliReplServerConfig } from '@famir/repl-server'
import { MinioStorageConfig } from '@famir/storage'
import { BullWorkflowConfig } from '@famir/workflow'

export type AppCliConfig = PinoLoggerConfig &
  RedisDatabaseConfig &
  MinioStorageConfig &
  BullWorkflowConfig &
  CliReplServerConfig

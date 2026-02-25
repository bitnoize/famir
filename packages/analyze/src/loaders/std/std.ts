import { RedisDatabaseConfig } from '@famir/database'
import { BullExecutorConfig } from '@famir/executor'
import { PinoLoggerConfig } from '@famir/logger'
import { MinioStorageConfig } from '@famir/storage'
import { BullWorkflowConfig } from '@famir/workflow'

export type AppStdConfig = PinoLoggerConfig &
  RedisDatabaseConfig &
  MinioStorageConfig &
  BullWorkflowConfig &
  BullExecutorConfig

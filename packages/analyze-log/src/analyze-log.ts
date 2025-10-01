import { DatabaseConfig } from '@famir/database'
import { ExecutorConfig } from '@famir/executor'
import { LoggerConfig } from '@famir/logger'
import { StorageConfig } from '@famir/storage'
import { WorkflowConfig } from '@famir/workflow'

export type AnalyzeLogConfig = LoggerConfig &
  DatabaseConfig &
  StorageConfig &
  WorkflowConfig &
  ExecutorConfig

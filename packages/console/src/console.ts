import { DatabaseConfig } from '@famir/database'
import { LoggerConfig } from '@famir/logger'
import { ReplServerConfig } from '@famir/repl-server'
import { StorageConfig } from '@famir/storage'
import { WorkflowConfig } from '@famir/workflow'

export type ConsoleConfig = LoggerConfig &
  DatabaseConfig &
  StorageConfig &
  WorkflowConfig &
  ReplServerConfig

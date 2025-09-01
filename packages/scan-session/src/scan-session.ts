import { DatabaseConfig } from '@famir/database'
import { LoggerConfig } from '@famir/logger'
import { TaskWorkerConfig } from '@famir/task-worker'

export type ScanSessionConfig = LoggerConfig & DatabaseConfig & TaskWorkerConfig

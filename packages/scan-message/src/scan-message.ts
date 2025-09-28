import { DatabaseConfig } from '@famir/database'
import { LoggerConfig } from '@famir/logger'
import { ExecutorConfig } from '@famir/executor'

export type ScanMessageConfig = LoggerConfig & DatabaseConfig & ExecutorConfig

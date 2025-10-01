import { DatabaseConfig } from '@famir/database'
import { LoggerConfig } from '@famir/logger'
import { ExecutorConfig } from '@famir/executor'
import { WorkflowConfig } from '@famir/workflow'

export type AnalyzeLogConfig = LoggerConfig & DatabaseConfig & WorkflowConfig & ExecutorConfig

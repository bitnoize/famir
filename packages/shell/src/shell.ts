import { DatabaseConfig } from '@famir/database'
import { LoggerConfig } from '@famir/logger'
import { ReplServerConfig } from '@famir/repl-server'
import { WorkflowConfig } from '@famir/workflow'

export type ShellConfig = LoggerConfig & DatabaseConfig & WorkflowConfig & ReplServerConfig

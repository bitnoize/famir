import { DatabaseConfig } from '@famir/database'
import { LoggerConfig } from '@famir/logger'
import { ReplServerConfig } from '@famir/repl-server'
import { TaskQueueConfig } from '@famir/task-queue'

export type ShellConfig = LoggerConfig & DatabaseConfig & TaskQueueConfig & ReplServerConfig

import { DatabaseConfig } from '@famir/database'
import { HttpClientConfig } from '@famir/http-client'
import { HttpServerConfig } from '@famir/http-server'
import { LoggerConfig } from '@famir/logger'
import { TaskQueueConfig } from '@famir/task-queue'

export type ReverseProxyConfig = LoggerConfig &
  DatabaseConfig &
  TaskQueueConfig &
  HttpClientConfig &
  HttpServerConfig

import { DatabaseConfig } from '@famir/database'
import { HttpServerConfig } from '@famir/http-server'
import { LoggerConfig } from '@famir/logger'
import { WorkflowConfig } from '@famir/workflow'

export type ReverseProxyConfig = LoggerConfig & DatabaseConfig & WorkflowConfig & HttpServerConfig

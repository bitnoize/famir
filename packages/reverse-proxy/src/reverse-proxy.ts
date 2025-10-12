import { DatabaseConfig } from '@famir/database'
import { HttpClientConfig } from '@famir/http-client'
import { HttpServerConfig } from '@famir/http-server'
import { LoggerConfig } from '@famir/logger'
import { WorkflowConfig } from '@famir/workflow'

export type ReverseProxyConfig = LoggerConfig &
  DatabaseConfig &
  WorkflowConfig &
  HttpClientConfig &
  HttpServerConfig

export const REVERSE_PROXY_NAME = 'reverse-proxy'

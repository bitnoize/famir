import { RedisDatabaseConfig } from '@famir/database'
import { CurlHttpClientConfig } from '@famir/http-client'
import { NodeHttpServerConfig } from '@famir/http-server'
import { PinoLoggerConfig } from '@famir/logger'
import { BullWorkflowConfig } from '@famir/workflow'

export type AppDefaultConfig = PinoLoggerConfig &
  RedisDatabaseConfig &
  BullWorkflowConfig &
  CurlHttpClientConfig &
  NodeHttpServerConfig

import { configDatabaseConnectionUrlSchema } from '@famir/database'
import {
  configLoggerAppNameSchema,
  configLoggerLogLevelSchema,
  configLoggerTransportOptionsSchema,
  configLoggerTransportTargetSchema
} from '@famir/logger'
import {
  configReplServerAddressSchema,
  configReplServerMaxConnectionsSchema,
  configReplServerPortSchema,
  configReplServerPromptSchema,
  configReplServerSocketTimeoutSchema,
  configReplServerUseColorsSchema
} from '@famir/repl-server'
import { configTaskQueueConnectionUrlSchema } from '@famir/task-queue'
import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import {
  createCampaignDtoSchema,
  createProxyDtoSchema,
  createTargetDtoSchema,
  deleteProxyDtoSchema,
  deleteTargetDtoSchema,
  disableProxyDtoSchema,
  disableTargetDtoSchema,
  enableProxyDtoSchema,
  enableTargetDtoSchema,
  readProxyDtoSchema,
  readTargetDtoSchema,
  updateCampaignDtoSchema,
  updateTargetDtoSchema
} from './controllers/index.js'
import { ShellConfig } from './shell.js'

export const configShellSchema: JSONSchemaType<ShellConfig> = {
  type: 'object',
  required: [
    'LOGGER_APP_NAME',
    'LOGGER_LOG_LEVEL',
    'LOGGER_TRANSPORT_TARGET',
    'LOGGER_TRANSPORT_OPTIONS',
    'DATABASE_CONNECTION_URL',
    'TASK_QUEUE_CONNECTION_URL',
    'REPL_SERVER_ADDRESS',
    'REPL_SERVER_PORT',
    'REPL_SERVER_MAX_CONNECTIONS',
    'REPL_SERVER_SOCKET_TIMEOUT',
    'REPL_SERVER_PROMPT',
    'REPL_SERVER_USE_COLORS'
  ],
  properties: {
    LOGGER_APP_NAME: {
      ...configLoggerAppNameSchema,
      default: 'shell'
    },
    LOGGER_LOG_LEVEL: configLoggerLogLevelSchema,
    LOGGER_TRANSPORT_TARGET: configLoggerTransportTargetSchema,
    LOGGER_TRANSPORT_OPTIONS: configLoggerTransportOptionsSchema,
    DATABASE_CONNECTION_URL: configDatabaseConnectionUrlSchema,
    TASK_QUEUE_CONNECTION_URL: configTaskQueueConnectionUrlSchema,
    REPL_SERVER_ADDRESS: {
      ...configReplServerAddressSchema,
      default: '127.0.0.1'
    },
    REPL_SERVER_PORT: {
      ...configReplServerPortSchema,
      default: 5000
    },
    REPL_SERVER_MAX_CONNECTIONS: configReplServerMaxConnectionsSchema,
    REPL_SERVER_SOCKET_TIMEOUT: configReplServerSocketTimeoutSchema,
    REPL_SERVER_PROMPT: configReplServerPromptSchema,
    REPL_SERVER_USE_COLORS: configReplServerUseColorsSchema
  },
  additionalProperties: false
} as const

export const shellSchemas: ValidatorSchemas = {
  'create-campaign-dto': createCampaignDtoSchema,
  'update-campaign-dto': updateCampaignDtoSchema,
  'create-proxy-dto': createProxyDtoSchema,
  'read-proxy-dto': readProxyDtoSchema,
  'enable-proxy-dto': enableProxyDtoSchema,
  'disable-proxy-dto': disableProxyDtoSchema,
  'delete-proxy-dto': deleteProxyDtoSchema,
  'create-target-dto': createTargetDtoSchema,
  'read-target-dto': readTargetDtoSchema,
  'update-target-dto': updateTargetDtoSchema,
  'enable-target-dto': enableTargetDtoSchema,
  'disable-target-dto': disableTargetDtoSchema,
  'delete-target-dto': deleteTargetDtoSchema
}

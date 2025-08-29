import { configDatabaseConnectionUrlSchema } from '@famir/database'
import {
  configLoggerAppNameSchema,
  configLoggerLevelSchema,
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
    'LOGGER_LEVEL',
    'LOGGER_APP_NAME',
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
    LOGGER_LEVEL: configLoggerLevelSchema,
    LOGGER_APP_NAME: configLoggerAppNameSchema,
    LOGGER_TRANSPORT_TARGET: configLoggerTransportTargetSchema,
    LOGGER_TRANSPORT_OPTIONS: configLoggerTransportOptionsSchema,
    DATABASE_CONNECTION_URL: configDatabaseConnectionUrlSchema,
    TASK_QUEUE_CONNECTION_URL: configTaskQueueConnectionUrlSchema,
    REPL_SERVER_ADDRESS: configReplServerAddressSchema,
    REPL_SERVER_PORT: configReplServerPortSchema,
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

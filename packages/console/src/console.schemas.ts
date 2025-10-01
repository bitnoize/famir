import { JSONSchemaType } from '@famir/common'
import { configDatabaseConnectionUrlSchema, configDatabasePrefixSchema } from '@famir/database'
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
import {
  configStorageAccessKeySchema,
  configStorageEndPointSchema,
  configStoragePortSchema,
  configStorageSecretKeySchema,
  configStorageUseSSLSchema
} from '@famir/storage'
import { configWorkflowConnectionUrlSchema, configWorkflowPrefixSchema } from '@famir/workflow'
import { ConsoleConfig } from './console.js'

export const configConsoleSchema: JSONSchemaType<ConsoleConfig> = {
  type: 'object',
  required: [
    'LOGGER_APP_NAME',
    'LOGGER_LOG_LEVEL',
    'LOGGER_TRANSPORT_TARGET',
    'LOGGER_TRANSPORT_OPTIONS',
    'DATABASE_CONNECTION_URL',
    'DATABASE_PREFIX',
    'STORAGE_END_POINT',
    'STORAGE_PORT',
    'STORAGE_USE_SSL',
    'STORAGE_ACCESS_KEY',
    'STORAGE_SECRET_KEY',
    'WORKFLOW_CONNECTION_URL',
    'WORKFLOW_PREFIX',
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
      default: 'console'
    },
    LOGGER_LOG_LEVEL: configLoggerLogLevelSchema,
    LOGGER_TRANSPORT_TARGET: configLoggerTransportTargetSchema,
    LOGGER_TRANSPORT_OPTIONS: configLoggerTransportOptionsSchema,
    DATABASE_CONNECTION_URL: configDatabaseConnectionUrlSchema,
    DATABASE_PREFIX: configDatabasePrefixSchema,
    STORAGE_END_POINT: configStorageEndPointSchema,
    STORAGE_PORT: configStoragePortSchema,
    STORAGE_USE_SSL: configStorageUseSSLSchema,
    STORAGE_ACCESS_KEY: configStorageAccessKeySchema,
    STORAGE_SECRET_KEY: configStorageSecretKeySchema,
    WORKFLOW_CONNECTION_URL: configWorkflowConnectionUrlSchema,
    WORKFLOW_PREFIX: configWorkflowPrefixSchema,
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

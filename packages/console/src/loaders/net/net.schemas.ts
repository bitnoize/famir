import {
  configRedisDatabaseConnectionUrlSchema,
  configRedisDatabasePrefixSchema
} from '@famir/database'
import {
  configLoggerAppNameSchema,
  configLoggerLogLevelSchema,
  configPinoLoggerTransportOptionsSchema,
  configPinoLoggerTransportTargetSchema
} from '@famir/logger'
import {
  configNetReplServerAddressSchema,
  configNetReplServerMaxClientsSchema,
  configNetReplServerPortSchema,
  configNetReplServerSocketTimeoutSchema,
  configReplServerPromptSchema,
  configReplServerUseColorsSchema
} from '@famir/repl-server'
import {
  configMinioStorageEndPointSchema,
  configMinioStoragePortSchema,
  configMinioStorageUseSSLSchema,
  configStorageAccessKeySchema,
  configStorageSecretKeySchema
} from '@famir/storage'
import { JSONSchemaType } from '@famir/validator'
import {
  configRedisWorkflowConnectionUrlSchema,
  configRedisWorkflowPrefixSchema
} from '@famir/workflow'
import { AppNetConfig } from './net.js'

export const configAppNetSchema: JSONSchemaType<AppNetConfig> = {
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
    'REPL_SERVER_MAX_CLIENTS',
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
    LOGGER_TRANSPORT_TARGET: configPinoLoggerTransportTargetSchema,
    LOGGER_TRANSPORT_OPTIONS: configPinoLoggerTransportOptionsSchema,
    DATABASE_CONNECTION_URL: configRedisDatabaseConnectionUrlSchema,
    DATABASE_PREFIX: configRedisDatabasePrefixSchema,
    STORAGE_END_POINT: configMinioStorageEndPointSchema,
    STORAGE_PORT: configMinioStoragePortSchema,
    STORAGE_USE_SSL: configMinioStorageUseSSLSchema,
    STORAGE_ACCESS_KEY: configStorageAccessKeySchema,
    STORAGE_SECRET_KEY: configStorageSecretKeySchema,
    WORKFLOW_CONNECTION_URL: configRedisWorkflowConnectionUrlSchema,
    WORKFLOW_PREFIX: configRedisWorkflowPrefixSchema,
    REPL_SERVER_ADDRESS: {
      ...configNetReplServerAddressSchema,
      default: '127.0.0.1'
    },
    REPL_SERVER_PORT: {
      ...configNetReplServerPortSchema,
      default: 5000
    },
    REPL_SERVER_MAX_CLIENTS: configNetReplServerMaxClientsSchema,
    REPL_SERVER_SOCKET_TIMEOUT: configNetReplServerSocketTimeoutSchema,
    REPL_SERVER_PROMPT: configReplServerPromptSchema,
    REPL_SERVER_USE_COLORS: configReplServerUseColorsSchema
  },
  additionalProperties: false
} as const

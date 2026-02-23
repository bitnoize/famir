import {
  configRedisDatabaseConnectionUrlSchema,
  configRedisDatabasePrefixSchema
} from '@famir/database'
import { configHttpClientVerboseSchema } from '@famir/http-client'
import {
  configHttpServerAddressSchema,
  configHttpServerErrorPageSchema,
  configHttpServerPortSchema,
  configHttpServerVerboseSchema
} from '@famir/http-server'
import {
  configLoggerAppNameSchema,
  configLoggerLogLevelSchema,
  configPinoLoggerTransportOptionsSchema,
  configPinoLoggerTransportTargetSchema
} from '@famir/logger'
import { JSONSchemaType } from '@famir/validator'
import {
  configRedisWorkflowConnectionUrlSchema,
  configRedisWorkflowPrefixSchema
} from '@famir/workflow'
import { AppDefaultConfig } from './default.js'

export const configAppDefaultSchema: JSONSchemaType<AppDefaultConfig> = {
  type: 'object',
  required: [
    'LOGGER_APP_NAME',
    'LOGGER_LOG_LEVEL',
    'LOGGER_TRANSPORT_TARGET',
    'LOGGER_TRANSPORT_OPTIONS',
    'DATABASE_CONNECTION_URL',
    'DATABASE_PREFIX',
    'WORKFLOW_CONNECTION_URL',
    'WORKFLOW_PREFIX',
    'HTTP_CLIENT_VERBOSE',
    'HTTP_SERVER_ADDRESS',
    'HTTP_SERVER_PORT',
    'HTTP_SERVER_VERBOSE',
    'HTTP_SERVER_ERROR_PAGE'
  ],
  properties: {
    LOGGER_APP_NAME: {
      ...configLoggerAppNameSchema,
      default: 'reverse-proxy'
    },
    LOGGER_LOG_LEVEL: configLoggerLogLevelSchema,
    LOGGER_TRANSPORT_TARGET: configPinoLoggerTransportTargetSchema,
    LOGGER_TRANSPORT_OPTIONS: configPinoLoggerTransportOptionsSchema,
    DATABASE_CONNECTION_URL: configRedisDatabaseConnectionUrlSchema,
    DATABASE_PREFIX: configRedisDatabasePrefixSchema,
    WORKFLOW_CONNECTION_URL: configRedisWorkflowConnectionUrlSchema,
    WORKFLOW_PREFIX: configRedisWorkflowPrefixSchema,
    HTTP_CLIENT_VERBOSE: configHttpClientVerboseSchema,
    HTTP_SERVER_ADDRESS: {
      ...configHttpServerAddressSchema,
      default: '127.0.0.1'
    },
    HTTP_SERVER_PORT: {
      ...configHttpServerPortSchema,
      default: 3000
    },
    HTTP_SERVER_VERBOSE: configHttpServerVerboseSchema,
    HTTP_SERVER_ERROR_PAGE: configHttpServerErrorPageSchema
  },
  additionalProperties: false
} as const

import { configDatabaseConnectionUrlSchema } from '@famir/database'
import { configHttpClientBodyLimitSchema } from '@famir/http-client'
import {
  configHttpServerAddressSchema,
  configHttpServerBodyLimitSchema,
  configHttpServerPortSchema
} from '@famir/http-server'
import {
  configLoggerAppNameSchema,
  configLoggerLevelSchema,
  configLoggerTransportOptionsSchema,
  configLoggerTransportTargetSchema
} from '@famir/logger'
import { configTaskQueueConnectionUrlSchema } from '@famir/task-queue'
import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import { ReverseProxyConfig } from './reverse-proxy.js'

export const configReverseProxySchema: JSONSchemaType<ReverseProxyConfig> = {
  type: 'object',
  required: [
    'LOGGER_LEVEL',
    'LOGGER_APP_NAME',
    'LOGGER_TRANSPORT_TARGET',
    'LOGGER_TRANSPORT_OPTIONS',
    'DATABASE_CONNECTION_URL',
    'TASK_QUEUE_CONNECTION_URL',
    'HTTP_CLIENT_BODY_LIMIT',
    'HTTP_SERVER_ADDRESS',
    'HTTP_SERVER_PORT',
    'HTTP_SERVER_BODY_LIMIT'
  ],
  properties: {
    LOGGER_LEVEL: configLoggerLevelSchema,
    LOGGER_APP_NAME: configLoggerAppNameSchema,
    LOGGER_TRANSPORT_TARGET: configLoggerTransportTargetSchema,
    LOGGER_TRANSPORT_OPTIONS: configLoggerTransportOptionsSchema,
    DATABASE_CONNECTION_URL: configDatabaseConnectionUrlSchema,
    TASK_QUEUE_CONNECTION_URL: configTaskQueueConnectionUrlSchema,
    HTTP_CLIENT_BODY_LIMIT: configHttpClientBodyLimitSchema,
    HTTP_SERVER_ADDRESS: configHttpServerAddressSchema,
    HTTP_SERVER_PORT: configHttpServerPortSchema,
    HTTP_SERVER_BODY_LIMIT: configHttpServerBodyLimitSchema
  },
  additionalProperties: false
} as const

export const reverseProxySchemas: ValidatorSchemas = {}

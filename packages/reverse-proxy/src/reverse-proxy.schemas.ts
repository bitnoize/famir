import { configDatabaseConnectionUrlSchema, configDatabasePrefixSchema } from '@famir/database'
import { configHttpClientBodyLimitSchema } from '@famir/http-client'
import {
  configHttpServerAddressSchema,
  configHttpServerBodyLimitSchema,
  configHttpServerPortSchema
} from '@famir/http-server'
import {
  configLoggerAppNameSchema,
  configLoggerLogLevelSchema,
  configLoggerTransportOptionsSchema,
  configLoggerTransportTargetSchema
} from '@famir/logger'
import { configWorkflowConnectionUrlSchema, configWorkflowPrefixSchema } from '@famir/workflow'
import { ValidatorSchemas } from '@famir/domain'
import { JSONSchemaType } from '@famir/common'
import { ReverseProxyConfig } from './reverse-proxy.js'

export const configReverseProxySchema: JSONSchemaType<ReverseProxyConfig> = {
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
    'HTTP_CLIENT_BODY_LIMIT',
    'HTTP_SERVER_ADDRESS',
    'HTTP_SERVER_PORT',
    'HTTP_SERVER_BODY_LIMIT'
  ],
  properties: {
    LOGGER_APP_NAME: {
      ...configLoggerAppNameSchema,
      default: 'reverse-proxy'
    },
    LOGGER_LOG_LEVEL: configLoggerLogLevelSchema,
    LOGGER_TRANSPORT_TARGET: configLoggerTransportTargetSchema,
    LOGGER_TRANSPORT_OPTIONS: configLoggerTransportOptionsSchema,
    DATABASE_CONNECTION_URL: configDatabaseConnectionUrlSchema,
    DATABASE_PREFIX: configDatabasePrefixSchema,
    WORKFLOW_CONNECTION_URL: configWorkflowConnectionUrlSchema,
    WORKFLOW_PREFIX: configWorkflowPrefixSchema,
    HTTP_CLIENT_BODY_LIMIT: configHttpClientBodyLimitSchema,
    HTTP_SERVER_ADDRESS: {
      ...configHttpServerAddressSchema,
      default: '127.0.0.1'
    },
    HTTP_SERVER_PORT: {
      ...configHttpServerPortSchema,
      default: 3000
    },
    HTTP_SERVER_BODY_LIMIT: configHttpServerBodyLimitSchema
  },
  additionalProperties: false
} as const

export const reverseProxySchemas: ValidatorSchemas = {}

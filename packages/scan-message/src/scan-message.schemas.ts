import { configDatabaseConnectionUrlSchema, configDatabasePrefixSchema } from '@famir/database'
import {
  configLoggerAppNameSchema,
  configLoggerLogLevelSchema,
  configLoggerTransportOptionsSchema,
  configLoggerTransportTargetSchema
} from '@famir/logger'
import {
  configExecutorPrefixSchema,
  configExecutorConcurrencySchema,
  configExecutorConnectionUrlSchema,
  configExecutorLimiterDurationSchema,
  configExecutorLimiterMaxSchema
} from '@famir/executor'
import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import { ScanMessageConfig } from './scan-message.js'

export const configScanMessageSchema: JSONSchemaType<ScanMessageConfig> = {
  type: 'object',
  required: [
    'LOGGER_APP_NAME',
    'LOGGER_LOG_LEVEL',
    'LOGGER_TRANSPORT_TARGET',
    'LOGGER_TRANSPORT_OPTIONS',
    'DATABASE_CONNECTION_URL',
    'DATABASE_PREFIX',
    'EXECUTOR_CONNECTION_URL',
    'EXECUTOR_PREFIX',
    'EXECUTOR_CONCURRENCY',
    'EXECUTOR_LIMITER_MAX',
    'EXECUTOR_LIMITER_DURATION'
  ],
  properties: {
    LOGGER_APP_NAME: {
      ...configLoggerAppNameSchema,
      default: 'scan-message'
    },
    LOGGER_LOG_LEVEL: configLoggerLogLevelSchema,
    LOGGER_TRANSPORT_TARGET: configLoggerTransportTargetSchema,
    LOGGER_TRANSPORT_OPTIONS: configLoggerTransportOptionsSchema,
    DATABASE_CONNECTION_URL: configDatabaseConnectionUrlSchema,
    DATABASE_PREFIX: configDatabasePrefixSchema,
    EXECUTOR_CONNECTION_URL: configExecutorConnectionUrlSchema,
    EXECUTOR_PREFIX: configExecutorPrefixSchema,
    EXECUTOR_CONCURRENCY: {
      ...configExecutorConcurrencySchema,
      default: 2
    },
    EXECUTOR_LIMITER_MAX: {
      ...configExecutorLimiterMaxSchema,
      default: 1
    },
    EXECUTOR_LIMITER_DURATION: {
      ...configExecutorLimiterDurationSchema,
      default: 1000
    }
  },
  additionalProperties: false
} as const

export const scanMessageSchemas: ValidatorSchemas = {}

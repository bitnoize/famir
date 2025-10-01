import { JSONSchemaType } from '@famir/common'
import { configDatabaseConnectionUrlSchema, configDatabasePrefixSchema } from '@famir/database'
import { AnalyzeLogJobData } from '@famir/domain'
import {
  configExecutorConcurrencySchema,
  configExecutorConnectionUrlSchema,
  configExecutorLimiterDurationSchema,
  configExecutorLimiterMaxSchema,
  configExecutorPrefixSchema
} from '@famir/executor'
import {
  configLoggerAppNameSchema,
  configLoggerLogLevelSchema,
  configLoggerTransportOptionsSchema,
  configLoggerTransportTargetSchema
} from '@famir/logger'
import {
  configStorageAccessKeySchema,
  configStorageEndPointSchema,
  configStoragePortSchema,
  configStorageSecretKeySchema,
  configStorageUseSSLSchema
} from '@famir/storage'
import { customIdentSchema, randomIdentSchema } from '@famir/validator'
import { configWorkflowConnectionUrlSchema, configWorkflowPrefixSchema } from '@famir/workflow'
import { AnalyzeLogConfig } from './analyze-log.js'

export const configAnalyzeLogSchema: JSONSchemaType<AnalyzeLogConfig> = {
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
    'EXECUTOR_CONNECTION_URL',
    'EXECUTOR_PREFIX',
    'EXECUTOR_CONCURRENCY',
    'EXECUTOR_LIMITER_MAX',
    'EXECUTOR_LIMITER_DURATION'
  ],
  properties: {
    LOGGER_APP_NAME: {
      ...configLoggerAppNameSchema,
      default: 'analyze-log'
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

export const analyzeLogJobDataSchema: JSONSchemaType<AnalyzeLogJobData> = {
  type: 'object',
  required: ['campaignId', 'messageId'],
  properties: {
    campaignId: customIdentSchema,
    messageId: randomIdentSchema
  },
  additionalProperties: false
} as const

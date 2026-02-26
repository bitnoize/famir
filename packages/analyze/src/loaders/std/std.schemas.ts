import {
  configRedisDatabaseConnectionUrlSchema,
  configRedisDatabasePrefixSchema
} from '@famir/database'
import {
  configRedisExecutorConnectionUrlSchema,
  configRedisExecutorPrefixSchema
} from '@famir/executor'
import {
  configLoggerAppNameSchema,
  configLoggerLogLevelSchema,
  configPinoLoggerTransportOptionsSchema,
  configPinoLoggerTransportTargetSchema
} from '@famir/logger'
import {
  configMinioStorageEndPointSchema,
  configMinioStoragePortSchema,
  configMinioStorageUseSSLSchema,
  configStorageAccessKeySchema,
  configStorageBucketNameSchema,
  configStorageSecretKeySchema
} from '@famir/storage'
import { JSONSchemaType } from '@famir/validator'
import {
  configRedisWorkflowConnectionUrlSchema,
  configRedisWorkflowPrefixSchema
} from '@famir/workflow'
import { AppStdConfig } from './std.js'

export const configAppStdSchema: JSONSchemaType<AppStdConfig> = {
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
    'STORAGE_BUCKET_NAME',
    'WORKFLOW_CONNECTION_URL',
    'WORKFLOW_PREFIX',
    'EXECUTOR_CONNECTION_URL',
    'EXECUTOR_PREFIX'
  ],
  properties: {
    LOGGER_APP_NAME: {
      ...configLoggerAppNameSchema,
      default: 'analyze'
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
    STORAGE_BUCKET_NAME: configStorageBucketNameSchema,
    WORKFLOW_CONNECTION_URL: configRedisWorkflowConnectionUrlSchema,
    WORKFLOW_PREFIX: configRedisWorkflowPrefixSchema,
    EXECUTOR_CONNECTION_URL: configRedisExecutorConnectionUrlSchema,
    EXECUTOR_PREFIX: configRedisExecutorPrefixSchema
  },
  additionalProperties: false
} as const

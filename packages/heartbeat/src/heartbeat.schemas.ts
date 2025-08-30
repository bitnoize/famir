import { configDatabaseConnectionUrlSchema } from '@famir/database'
import {
  configLoggerAppNameSchema,
  configLoggerLogLevelSchema,
  configLoggerTransportOptionsSchema,
  configLoggerTransportTargetSchema
} from '@famir/logger'
import { configTaskQueueConnectionUrlSchema } from '@famir/task-queue'
import {
  configTaskWorkerConcurrencySchema,
  configTaskWorkerConnectionUrlSchema,
  configTaskWorkerLimiterDurationSchema,
  configTaskWorkerLimiterMaxSchema
} from '@famir/task-worker'
import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import { HeartbeatConfig } from './heartbeat.js'

export const configHeartbeatSchema: JSONSchemaType<HeartbeatConfig> = {
  type: 'object',
  required: [
    'LOGGER_APP_NAME',
    'LOGGER_LOG_LEVEL',
    'LOGGER_TRANSPORT_TARGET',
    'LOGGER_TRANSPORT_OPTIONS',
    'DATABASE_CONNECTION_URL',
    'TASK_QUEUE_CONNECTION_URL',
    'TASK_WORKER_CONNECTION_URL',
    'TASK_WORKER_CONCURRENCY',
    'TASK_WORKER_LIMITER_MAX',
    'TASK_WORKER_LIMITER_DURATION'
  ],
  properties: {
    LOGGER_APP_NAME: {
      ...configLoggerAppNameSchema,
      default: 'heartbeat'
    },
    LOGGER_LOG_LEVEL: configLoggerLogLevelSchema,
    LOGGER_TRANSPORT_TARGET: configLoggerTransportTargetSchema,
    LOGGER_TRANSPORT_OPTIONS: configLoggerTransportOptionsSchema,
    DATABASE_CONNECTION_URL: configDatabaseConnectionUrlSchema,
    TASK_QUEUE_CONNECTION_URL: configTaskQueueConnectionUrlSchema,
    TASK_WORKER_CONNECTION_URL: configTaskWorkerConnectionUrlSchema,
    TASK_WORKER_CONCURRENCY: {
      ...configTaskWorkerConcurrencySchema,
      default: 2
    },
    TASK_WORKER_LIMITER_MAX: {
      ...configTaskWorkerLimiterMaxSchema,
      default: 1
    },
    TASK_WORKER_LIMITER_DURATION: {
      ...configTaskWorkerLimiterDurationSchema,
      default: 1000
    }
  },
  additionalProperties: false
} as const

export const heartbeatSchemas: ValidatorSchemas = {}

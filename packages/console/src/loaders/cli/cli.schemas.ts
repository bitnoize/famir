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
import { configReplServerPromptSchema, configReplServerUseColorsSchema } from '@famir/repl-server'
import { JSONSchemaType } from '@famir/validator'
import {
  configRedisWorkflowConnectionUrlSchema,
  configRedisWorkflowPrefixSchema
} from '@famir/workflow'
import { AppCliConfig } from './cli.js'

export const configAppCliSchema: JSONSchemaType<AppCliConfig> = {
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
    WORKFLOW_CONNECTION_URL: configRedisWorkflowConnectionUrlSchema,
    WORKFLOW_PREFIX: configRedisWorkflowPrefixSchema,
    REPL_SERVER_PROMPT: configReplServerPromptSchema,
    REPL_SERVER_USE_COLORS: configReplServerUseColorsSchema
  },
  additionalProperties: false
} as const

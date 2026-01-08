import { JSONSchemaType } from '@famir/common'
import { ValidatorSchemas } from '@famir/domain'
import {
  LOGGER_LOG_LEVELS,
  LOGGER_TRANSPORT_TARGETS,
  LoggerLogLevel,
  LoggerTransportOptions,
  LoggerTransportTarget
} from './logger.js'

const loggerTransportOptionsSchema: JSONSchemaType<LoggerTransportOptions> = {
  type: 'object',
  required: [],
  properties: {}
} as const

export const loggerSchemas: ValidatorSchemas = {
  'logger-transport-options': loggerTransportOptionsSchema
} as const

export const configLoggerAppNameSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
}

export const configLoggerLogLevelSchema: JSONSchemaType<LoggerLogLevel> = {
  type: 'string',
  enum: LOGGER_LOG_LEVELS,
  default: LOGGER_LOG_LEVELS[1]
} as const

export const configLoggerTransportTargetSchema: JSONSchemaType<LoggerTransportTarget> = {
  type: 'string',
  enum: LOGGER_TRANSPORT_TARGETS,
  default: LOGGER_TRANSPORT_TARGETS[0]
} as const

export const configLoggerTransportOptionsSchema: JSONSchemaType<string> = {
  type: 'string',
  default: '{}'
} as const

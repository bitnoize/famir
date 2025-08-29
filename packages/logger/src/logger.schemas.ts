import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import {
  LOGGER_LEVELS,
  LOGGER_TRANSPORT_TARGETS,
  LoggerLevel,
  LoggerTransportOptions,
  LoggerTransportTarget
} from './logger.js'

export const configLoggerLevelSchema: JSONSchemaType<LoggerLevel> = {
  type: 'string',
  enum: LOGGER_LEVELS,
  default: LOGGER_LEVELS[1]
} as const

export const configLoggerAppNameSchema: JSONSchemaType<string> = {
  type: 'string',
  pattern: '^[0-9a-zA-Z-_]{1,128}$'
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

export const loggerTransportOptionsSchema: JSONSchemaType<LoggerTransportOptions> = {
  type: 'object',
  required: [],
  properties: {}
} as const

export const loggerSchemas: ValidatorSchemas = {
  'logger-transport-options': loggerTransportOptionsSchema
}

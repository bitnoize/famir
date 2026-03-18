import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import { LOGGER_LOG_LEVELS, LoggerLogLevel, PinoLoggerTransportOptions } from './logger.js'

const pinoLoggerTransportOptionsSchema: JSONSchemaType<PinoLoggerTransportOptions> = {
  type: 'object',
  required: [],
  properties: {}
} as const

export const pinoLoggerSchemas: ValidatorSchemas = {
  'logger-transport-options': pinoLoggerTransportOptionsSchema
} as const

//
// Config
//

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

export const configPinoLoggerTransportTargetSchema: JSONSchemaType<string> = {
  type: 'string',
  default: 'pino-pretty'
} as const

export const configPinoLoggerTransportOptionsSchema: JSONSchemaType<string> = {
  type: 'string',
  default: '{}'
} as const

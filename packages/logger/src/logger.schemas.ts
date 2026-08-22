import { JSONSchemaType } from '@famir/validator'
import { LOGGER_LOG_LEVELS, LoggerLogLevel, PinoLoggerConfig } from './logger.js'

/**
 * JSON Schema for validating a Pino logger log level.
 *
 * @internal
 */
const pinoLoggerLogLevelSchema: JSONSchemaType<LoggerLogLevel> = {
  type: 'string',
  enum: [...LOGGER_LOG_LEVELS],
  default: LOGGER_LOG_LEVELS[2],
} as const

/**
 * JSON Schema for validating a complete Pino logger configuration.
 *
 * @internal
 */
export const pinoLoggerConfigSchema: JSONSchemaType<PinoLoggerConfig> = {
  type: 'object',
  required: ['LOGGER_LOG_LEVEL'],
  properties: {
    LOGGER_LOG_LEVEL: pinoLoggerLogLevelSchema,
  },
  additionalProperties: false,
} as const

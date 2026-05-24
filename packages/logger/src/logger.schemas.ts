import { JSONSchemaType } from '@famir/validator'
import { LOGGER_LOG_LEVELS, LoggerLogLevel, PinoLoggerConfig } from './logger.js'

/**
 * JSON Schema for validating a Pino logger application name.
 *
 * @internal
 */
const pinoLoggerAppNameSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'unknown',
} as const

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
  required: ['LOGGER_APP_NAME', 'LOGGER_LOG_LEVEL'],
  properties: {
    LOGGER_APP_NAME: pinoLoggerAppNameSchema,
    LOGGER_LOG_LEVEL: pinoLoggerLogLevelSchema,
  },
  additionalProperties: false,
} as const

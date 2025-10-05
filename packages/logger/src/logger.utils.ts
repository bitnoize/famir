import { filterSecrets } from '@famir/common'
import { ValidatorAssertSchema, ValidatorSchemas } from '@famir/domain'
import { LoggerConfig, LoggerOptions, LoggerTransportOptions } from './logger.js'
import { loggerTransportOptionsSchema } from './logger.schemas.js'

export const addSchemas: ValidatorSchemas = {
  'logger-transport-options': loggerTransportOptionsSchema
}

export function buildOptions(
  assertSchema: ValidatorAssertSchema,
  data: LoggerConfig
): LoggerOptions {
  try {
    const transportOptions: unknown = JSON.parse(data.LOGGER_TRANSPORT_OPTIONS)

    assertSchema<LoggerTransportOptions>('logger-transport-options', transportOptions)

    return {
      logLevel: data.LOGGER_LOG_LEVEL,
      appName: data.LOGGER_APP_NAME,
      transportTarget: data.LOGGER_TRANSPORT_TARGET,
      transportOptions
    }
  } catch (error) {
    console.error(`Build options failed`, { error })

    process.exit(1)
  }
}

export function filterOptionsSecrets(data: object) {
  return filterSecrets(data, ['transportOptions'])
}

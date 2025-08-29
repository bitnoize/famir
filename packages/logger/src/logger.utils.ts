import { ValidatorAssertSchema } from '@famir/validator'
import { LoggerConfig, LoggerOptions, LoggerTransportOptions } from './logger.js'

export function buildOptions(
  assertSchema: ValidatorAssertSchema,
  data: LoggerConfig
): LoggerOptions {
  try {
    const transportOptions: unknown = JSON.parse(data.LOGGER_TRANSPORT_OPTIONS)

    assertSchema<LoggerTransportOptions>(
      'logger-transport-options',
      transportOptions,
      'transportOptions'
    )

    return {
      level: data.LOGGER_LEVEL,
      appName: data.LOGGER_APP_NAME,
      transportTarget: data.LOGGER_TRANSPORT_TARGET,
      transportOptions
    }
  } catch (error) {
    console.error(`Build options failed`, { error })

    process.exit(1)
  }
}

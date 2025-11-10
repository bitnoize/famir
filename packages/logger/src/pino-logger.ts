import { DIContainer } from '@famir/common'
import { Config, CONFIG, Logger, LOGGER, LoggerData, Validator, VALIDATOR } from '@famir/domain'
import pino from 'pino'
import { LoggerConfig, LoggerOptions, LoggerTransportOptions } from './logger.js'
import { loggerTransportOptionsSchema } from './logger.schemas.js'

export class PinoLogger implements Logger {
  static inject(container: DIContainer) {
    container.registerSingleton<Logger>(
      LOGGER,
      (c) =>
        new PinoLogger(c.resolve<Validator>(VALIDATOR), c.resolve<Config<LoggerConfig>>(CONFIG))
    )
  }

  protected readonly options: LoggerOptions
  protected readonly pino: pino.Logger

  constructor(
    private readonly validator: Validator,
    config: Config<LoggerConfig>
  ) {
    this.validator.addSchemas({
      'logger-transport-options': loggerTransportOptionsSchema
    })

    this.options = this.buildOptions(config.data)

    this.pino = pino({
      name: this.options.appName,
      level: this.options.logLevel,
      base: {},
      transport: {
        target: this.options.transportTarget,
        options: this.options.transportOptions
      }
    })
  }

  debug(msg: string, data: LoggerData = {}) {
    this.pino.debug(data, msg)
  }

  info(msg: string, data: LoggerData = {}) {
    this.pino.info(data, msg)
  }

  warn(msg: string, data: LoggerData = {}) {
    this.pino.warn(data, msg)
  }

  error(msg: string, data: LoggerData = {}) {
    this.pino.error(data, msg)
  }

  fatal(msg: string, data: LoggerData = {}) {
    this.pino.fatal(data, msg)
  }

  private buildOptions(config: LoggerConfig): LoggerOptions {
    try {
      const transportOptions: unknown = JSON.parse(config.LOGGER_TRANSPORT_OPTIONS)

      this.validator.assertSchema<LoggerTransportOptions>(
        'logger-transport-options',
        transportOptions
      )

      return {
        logLevel: config.LOGGER_LOG_LEVEL,
        appName: config.LOGGER_APP_NAME,
        transportTarget: config.LOGGER_TRANSPORT_TARGET,
        transportOptions
      }
    } catch (error) {
      console.error(`Build options failed`, { error })

      process.exit(1)
    }
  }
}

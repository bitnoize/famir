import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  LoggerData,
  Validator,
  VALIDATOR,
  ValidatorAssertSchema
} from '@famir/domain'
import pino from 'pino'
import { LoggerConfig, LoggerOptions } from './logger.js'
import { addSchemas, buildOptions } from './logger.utils.js'

export class PinoLogger implements Logger {
  static inject(container: DIContainer) {
    container.registerSingleton<Logger>(
      LOGGER,
      (c) =>
        new PinoLogger(c.resolve<Validator>(VALIDATOR), c.resolve<Config<LoggerConfig>>(CONFIG))
    )
  }

  protected readonly assertSchema: ValidatorAssertSchema
  protected readonly options: LoggerOptions
  protected readonly pino: pino.Logger

  constructor(validator: Validator, config: Config<LoggerConfig>) {
    this.assertSchema = validator.assertSchema

    validator.addSchemas(addSchemas)

    this.options = buildOptions(this.assertSchema, config.data)

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
}

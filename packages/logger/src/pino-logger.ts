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
import { addSchemas, buildOptions, filterOptionsSecrets } from './logger.utils.js'

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
  private readonly _pino: pino.Logger

  constructor(validator: Validator, config: Config<LoggerConfig>) {
    this.assertSchema = validator.assertSchema

    validator.addSchemas(addSchemas)

    this.options = buildOptions(this.assertSchema, config.data)

    this._pino = pino({
      name: this.options.appName,
      level: this.options.logLevel,
      base: {},
      transport: {
        target: this.options.transportTarget,
        options: this.options.transportOptions
      }
    })

    this.debug(
      {
        module: 'logger',
        options: filterOptionsSecrets(this.options)
      },
      `Logger initialized`
    )
  }

  debug(data: LoggerData, msg: string) {
    this._pino.debug(data, msg)
  }

  info(data: LoggerData, msg: string) {
    this._pino.info(data, msg)
  }

  warn(data: LoggerData, msg: string) {
    this._pino.warn(data, msg)
  }

  error(data: LoggerData, msg: string) {
    this._pino.error(data, msg)
  }

  fatal(data: LoggerData, msg: string) {
    this._pino.fatal(data, msg)
  }
}

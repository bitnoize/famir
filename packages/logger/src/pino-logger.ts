import { filterSecrets } from '@famir/common'
import { Config, Logger, LoggerContext, Validator, ValidatorAssertSchema } from '@famir/domain'
import pino from 'pino'
import { LoggerConfig, LoggerOptions } from './logger.js'
import { loggerSchemas } from './logger.schemas.js'
import { buildOptions } from './logger.utils.js'

export class PinoLogger implements Logger {
  protected readonly assertSchema: ValidatorAssertSchema
  protected readonly options: LoggerOptions
  private readonly _pino: pino.Logger

  constructor(validator: Validator, config: Config<LoggerConfig>) {
    this.assertSchema = validator.assertSchema

    validator.addSchemas(loggerSchemas)

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

    this.info(
      {
        options: filterSecrets(this.options, ['transportOptions'])
      },
      `Logger initialized`
    )
  }

  debug(context: LoggerContext, message: string) {
    this._pino.debug({ context }, message)
  }

  info(context: LoggerContext, message: string) {
    this._pino.info({ context }, message)
  }

  warn(context: LoggerContext, message: string) {
    this._pino.warn({ context }, message)
  }

  error(context: LoggerContext, message: string) {
    this._pino.error({ context }, message)
  }

  fatal(context: LoggerContext, message: string) {
    this._pino.fatal({ context }, message)
  }
}

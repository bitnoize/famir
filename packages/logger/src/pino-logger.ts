import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Validator, VALIDATOR } from '@famir/validator'
import pino from 'pino'
import {
  Logger,
  LOGGER,
  LOGGER_BACKEND,
  LoggerData,
  PinoLoggerBackend,
  PinoLoggerConfig,
  PinoLoggerOptions
} from './logger.js'

/*
 * Pino logger implementation
 */
export class PinoLogger implements Logger {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<Logger>(
      LOGGER,
      (c) =>
        new PinoLogger(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<PinoLoggerConfig>>(CONFIG),
          c.resolveOptional<PinoLoggerBackend>(LOGGER_BACKEND)
        )
    )
  }

  protected readonly options: PinoLoggerOptions
  protected readonly pino: PinoLoggerBackend

  constructor(
    protected readonly validator: Validator,
    config: Config<PinoLoggerConfig>,
    loggerBackend: PinoLoggerBackend | null
  ) {
    this.options = this.buildOptions(config.data)

    this.pino =
      loggerBackend ??
      pino({
        name: this.options.appName,
        level: this.options.logLevel
        //base: {},
      })

    this.debug(`Logger initialized`)
  }

  /*
   * Log debug message
   */
  debug(mesg: string, data: LoggerData = {}) {
    this.pino.debug(data, mesg)
  }

  /*
   * Log info message
   */
  info(mesg: string, data: LoggerData = {}) {
    this.pino.info(data, mesg)
  }

  /*
   * Log warn message
   */
  warn(mesg: string, data: LoggerData = {}) {
    this.pino.warn(data, mesg)
  }

  /*
   * Log error message
   */
  error(mesg: string, data: LoggerData = {}) {
    this.pino.error(data, mesg)
  }

  /*
   * Log fatal message
   */
  fatal(mesg: string, data: LoggerData = {}) {
    this.pino.fatal(data, mesg)
  }

  private buildOptions(config: PinoLoggerConfig): PinoLoggerOptions {
    return {
      logLevel: config.LOGGER_LOG_LEVEL,
      appName: config.LOGGER_APP_NAME
    }
  }
}

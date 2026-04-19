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
  PinoLoggerOptions,
} from './logger.js'

/**
 * Pino logger implementation
 * @category none
 */
export class PinoLogger implements Logger {
  /**
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
        level: this.options.logLevel,
        base: {},
      })

    this.debug(`Logger initialized`)
  }

  debug(msg: string, data: LoggerData | null = null) {
    this.pino.debug({ data }, msg)
  }

  info(msg: string, data: LoggerData | null = null) {
    this.pino.info({ data }, msg)
  }

  warn(msg: string, data: LoggerData | null = null) {
    this.pino.warn({ data }, msg)
  }

  error(msg: string, data: LoggerData | null = null) {
    this.pino.error({ data }, msg)
  }

  fatal(msg: string, data: LoggerData | null = null) {
    this.pino.fatal({ data }, msg)
  }

  private buildOptions(config: PinoLoggerConfig): PinoLoggerOptions {
    return {
      logLevel: config.LOGGER_LOG_LEVEL,
      appName: config.LOGGER_APP_NAME,
    }
  }
}

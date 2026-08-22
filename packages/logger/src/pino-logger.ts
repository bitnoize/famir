import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Validator, VALIDATOR } from '@famir/validator'
import pino from 'pino'
import { LOGGER_TRANSPORT, LoggerTransport } from './logger-transport.js'
import {
  Logger,
  LOGGER,
  LoggerData,
  LoggerLogLevel,
  LoggerSettings,
  PinoLoggerConfig,
} from './logger.js'
import { pinoLoggerConfigSchema } from './logger.schemas.js'

/**
 * Options for a Pino logger.
 */
interface PinoLoggerOptions extends LoggerSettings {
  logLevel: LoggerLogLevel
}

/**
 * Pino-based logger implementation.
 *
 * Uses the high-performance Pino library as the backend.
 *
 * @see https://getpino.io - Pino logger documentation
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - Optional {@link LoggerTransport} via {@link LOGGER_TRANSPORT} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { LOGGER, Logger, PinoLogger } from '@famir/logger'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * PinoLogger.register(container)
 *
 * // Resolve dependency from container
 * const logger = container.resolve<Logger>(LOGGER)
 *
 * // Log some messages
 * logger.debug(`Simple debug log message`)
 * logger.info(`Log message with structured data`, { foo: 'bar' })
 * ```
 */
export class PinoLogger implements Logger {
  /**
   * Registers the logger as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer, settings?: Partial<LoggerSettings>) {
    container.registerSingleton<Logger>(
      LOGGER,
      (c) =>
        new PinoLogger(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolveOptional<LoggerTransport>(LOGGER_TRANSPORT),
          settings
        )
    )
  }

  /** Built logger options. */
  protected readonly options: PinoLoggerOptions

  /** Underlying Pino instance. */
  protected readonly pino: pino.Logger

  /**
   * Creates a new logger instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param transport - The optional logger transport instance.
   * @param settings - The optional settings object.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config,
    transport: LoggerTransport | null,
    settings: Partial<LoggerSettings> = {}
  ) {
    this.validator.addSchema('logger-config', pinoLoggerConfigSchema)

    const conf = this.config.get<PinoLoggerConfig>('logger-config')
    this.options = this.buildOptions(conf, settings)

    this.pino = pino(
      {
        name: this.options.appName,
        level: this.options.logLevel,
        base: {},
      },
      transport ?? undefined
    )
  }

  trace(msg: string, data?: LoggerData) {
    if (data != null) {
      this.pino.trace({ data }, msg)
    } else {
      this.pino.trace(msg)
    }
  }

  debug(msg: string, data?: LoggerData) {
    if (data != null) {
      this.pino.debug({ data }, msg)
    } else {
      this.pino.debug(msg)
    }
  }

  info(msg: string, data?: LoggerData) {
    if (data != null) {
      this.pino.info({ data }, msg)
    } else {
      this.pino.info(msg)
    }
  }

  warn(msg: string, data?: LoggerData) {
    if (data != null) {
      this.pino.warn({ data }, msg)
    } else {
      this.pino.warn(msg)
    }
  }

  error(msg: string, data?: LoggerData) {
    if (data != null) {
      this.pino.error({ data }, msg)
    } else {
      this.pino.error(msg)
    }
  }

  fatal(msg: string, data?: LoggerData) {
    if (data != null) {
      this.pino.fatal({ data }, msg)
    } else {
      this.pino.fatal(msg)
    }
  }

  /**
   * Converts validated configuration and settings to a logger options.
   */
  private buildOptions(
    conf: PinoLoggerConfig,
    settings: Partial<LoggerSettings>
  ): PinoLoggerOptions {
    return {
      logLevel: conf.LOGGER_LOG_LEVEL,
      appName: settings.appName ?? 'unknown',
    }
  }
}

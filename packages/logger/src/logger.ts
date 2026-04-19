/**
 * @category none
 * @internal
 */
export const LOGGER = Symbol('Logger')

/**
 * @category none
 * @internal
 */
export const LOGGER_BACKEND = Symbol('LoggerBackend')

/**
 * Represents a logger
 *
 * @category none
 */
export interface Logger {
  /**
   * Log debug message
   */
  debug(msg: string, data?: LoggerData): void

  /**
   * Log info message
   */
  info(msg: string, data?: LoggerData): void

  /**
   * Log warn message
   */
  warn(msg: string, data?: LoggerData): void

  /**
   * Log error message
   */
  error(msg: string, data?: LoggerData): void

  /**
   * Log fatal message
   */
  fatal(msg: string, data?: LoggerData): void
}

/**
 * @category none
 */
export { Logger as PinoLoggerBackend } from 'pino'

/**
 * @category none
 */
export type LoggerData = Record<string, unknown>

/**
 * @category none
 */
export type PinoLoggerConfig = {
  LOGGER_APP_NAME: string
  LOGGER_LOG_LEVEL: string
}

/**
 * @category none
 * @internal
 */
export interface PinoLoggerOptions {
  appName: string
  logLevel: string
}

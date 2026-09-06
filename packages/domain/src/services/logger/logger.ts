/**
 * DI token for a logger implementation.
 *
 * @category Logger Service
 */
export const LOGGER = Symbol('Logger')

/**
 * Available log levels, ordered by increasing severity.
 *
 * @category Logger Service
 * @internal
 */
export const LOGGER_LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const

/**
 * Valid log level for a logger.
 *
 * @category Logger Service
 */
export type LoggerLogLevel = (typeof LOGGER_LOG_LEVELS)[number]

/**
 * Structured log data.
 *
 * @category Logger Service
 */
export type LoggerData = Record<string, unknown>

/**
 * Defines the public contract for a logger.
 *
 * Provides structured logging with methods for different severity levels.
 * All methods accept an optional data object for structured context.
 *
 * @category Logger Service
 */
export interface Logger {
  /**
   * Logs a trace message — application flow tracing.
   *
   * @param msg - The log message.
   * @param data - Optional structured data to attach to the log entry.
   */
  trace(msg: string, data?: LoggerData): void

  /**
   * Logs a debug message — detailed information for debugging.
   *
   * @param msg - The log message.
   * @param data - Optional structured data to attach to the log entry.
   */
  debug(msg: string, data?: LoggerData): void

  /**
   * Logs an info message — general application events.
   *
   * @param msg - The log message.
   * @param data - Optional structured data to attach to the log entry.
   */
  info(msg: string, data?: LoggerData): void

  /**
   * Logs a warning message — potentially problematic situations.
   *
   * @param msg - The log message.
   * @param data - Optional structured data to attach to the log entry.
   */
  warn(msg: string, data?: LoggerData): void

  /**
   * Logs an error message — errors that can be handled.
   *
   * @param msg - The log message.
   * @param data - Optional structured data to attach to the log entry.
   */
  error(msg: string, data?: LoggerData): void

  /**
   * Logs a fatal message — unrecoverable errors causing application shutdown.
   *
   * @param msg - The log message.
   * @param data - Optional structured data to attach to the log entry.
   */
  fatal(msg: string, data?: LoggerData): void
}

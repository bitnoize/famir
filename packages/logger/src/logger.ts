export const LOGGER = Symbol('Logger')
export const LOGGER_BACKEND = Symbol('LoggerBackend')

/**
 * Logger contract
 */
export interface Logger {
  debug(mesg: string, data?: LoggerData): void
  info(mesg: string, data?: LoggerData): void
  warn(mesg: string, data?: LoggerData): void
  error(mesg: string, data?: LoggerData): void
  fatal(mesg: string, data?: LoggerData): void
}

export { Logger as PinoLoggerBackend } from 'pino'

export type LoggerData = Record<string, unknown>

export type PinoLoggerConfig = {
  LOGGER_APP_NAME: string
  LOGGER_LOG_LEVEL: string
}

export interface PinoLoggerOptions {
  appName: string
  logLevel: string
}

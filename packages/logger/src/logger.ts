export const LOGGER = Symbol('Logger')

export interface Logger {
  debug(mesg: string, data?: LoggerData): void
  info(mesg: string, data?: LoggerData): void
  warn(mesg: string, data?: LoggerData): void
  error(mesg: string, data?: LoggerData): void
  fatal(mesg: string, data?: LoggerData): void
}

export type LoggerData = Record<string, unknown>

export const LOGGER_LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'] as const
export type LoggerLogLevel = (typeof LOGGER_LOG_LEVELS)[number]

export const PINO_LOGGER_TRANSPORT_TARGETS = ['pino-pretty', 'pino-socket'] as const
export type PinoLoggerTransportTarget = (typeof PINO_LOGGER_TRANSPORT_TARGETS)[number]

export type PinoLoggerTransportOptions = Record<string, unknown>

export type PinoLoggerConfig = {
  LOGGER_APP_NAME: string
  LOGGER_LOG_LEVEL: LoggerLogLevel
  LOGGER_TRANSPORT_TARGET: PinoLoggerTransportTarget
  LOGGER_TRANSPORT_OPTIONS: string
}

export interface PinoLoggerOptions {
  appName: string
  logLevel: LoggerLogLevel
  transportTarget: PinoLoggerTransportTarget
  transportOptions: PinoLoggerTransportOptions
}

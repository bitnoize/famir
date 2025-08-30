import { ErrorContext } from '@famir/common'

export const LOGGER_LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'] as const

export type LoggerLogLevel = (typeof LOGGER_LOG_LEVELS)[number]

export const LOGGER_TRANSPORT_TARGETS = ['pino-pretty', 'pino-socket'] as const

export type LoggerTransportTarget = (typeof LOGGER_TRANSPORT_TARGETS)[number]

export type LoggerTransportOptions = Record<string, unknown>

export type LoggerConfig = {
  LOGGER_APP_NAME: string
  LOGGER_LOG_LEVEL: LoggerLogLevel
  LOGGER_TRANSPORT_TARGET: LoggerTransportTarget
  LOGGER_TRANSPORT_OPTIONS: string
}

export interface LoggerOptions {
  appName: string
  logLevel: LoggerLogLevel
  transportTarget: LoggerTransportTarget
  transportOptions: LoggerTransportOptions
}

export interface Logger {
  debug(context: ErrorContext | null, message: string): void
  info(context: ErrorContext | null, message: string): void
  warn(context: ErrorContext | null, message: string): void
  error(context: ErrorContext | null, message: string): void
  fatal(context: ErrorContext | null, message: string): void
}

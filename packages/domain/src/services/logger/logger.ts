export type LoggerData = Record<string, unknown>

export interface Logger {
  debug(msg: string, data?: LoggerData): void
  info(msg: string, data?: LoggerData): void
  warn(msg: string, data?: LoggerData): void
  error(msg: string, data?: LoggerData): void
  fatal(msg: string, data?: LoggerData): void
}

export const LOGGER = Symbol('Logger')

export type LoggerData = Record<string, unknown>

export const LOGGER = Symbol('Logger')

export interface Logger {
  debug(msg: string, data?: LoggerData): void
  info(msg: string, data?: LoggerData): void
  warn(msg: string, data?: LoggerData): void
  error(msg: string, data?: LoggerData): void
  fatal(msg: string, data?: LoggerData): void
}

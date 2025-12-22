export type LoggerData = Record<string, unknown>

export const LOGGER = Symbol('Logger')

export interface Logger {
  debug(mesg: string, data?: LoggerData): void
  info(mesg: string, data?: LoggerData): void
  warn(mesg: string, data?: LoggerData): void
  error(mesg: string, data?: LoggerData): void
  fatal(mesg: string, data?: LoggerData): void
}

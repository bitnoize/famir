export type LoggerData = Record<string, unknown>

export interface Logger {
  debug(data: LoggerData, msg: string): void
  info(data: LoggerData, msg: string): void
  warn(data: LoggerData, msg: string): void
  error(data: LoggerData, msg: string): void
  fatal(data: LoggerData, msg: string): void
}

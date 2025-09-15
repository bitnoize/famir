export type LoggerContext = Record<string, unknown>

export interface Logger {
  debug(context: LoggerContext, message: string): void
  info(context: LoggerContext, message: string): void
  warn(context: LoggerContext, message: string): void
  error(context: LoggerContext, message: string): void
  fatal(context: LoggerContext, message: string): void
}

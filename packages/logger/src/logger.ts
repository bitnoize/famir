import { ConfigData, LoggerLogLevel } from '@famir/domain'

/**
 * DI token for the optional logger transport.
 */
export const LOGGER_TRANSPORT = Symbol('LoggerTransport')

/**
 * Backend transport for a Pino logger.
 */
import type ThreadStream from 'thread-stream'
export { ThreadStream as LoggerTransport }

/**
 * Settings for a logger.
 */
export interface LoggerSettings {
  /** Application name to be used for logging. */
  appName: string
}

/**
 * Configuration for a Pino logger.
 */
export interface PinoLoggerConfig extends ConfigData {
  /** Logging level for the application. */
  LOGGER_LOG_LEVEL: LoggerLogLevel
}

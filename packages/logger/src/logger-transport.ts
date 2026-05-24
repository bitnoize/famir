/**
 * DI token for the optional logger transport.
 */
export const LOGGER_TRANSPORT = Symbol('LoggerTransport')

/**
 * Backend transport for a Pino logger.
 */
import type ThreadStream from 'thread-stream'
export type { ThreadStream as LoggerTransport }

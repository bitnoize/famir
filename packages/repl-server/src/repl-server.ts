import { ConfigData } from '@famir/domain'

/**
 * Configuration for a Cli repl-server.
 */
export interface CliReplServerConfig extends ConfigData {
  /** Whether to use ANSI colors. */
  REPL_SERVER_USE_COLORS: boolean
}

/**
 * Settings for a repl-server.
 */
export interface ReplServerSettings {
  prompt: string
  bannerGreet: string
  bannerLeave: string
}

/**
 * Default prompt.
 *
 * @category ReplServer Service
 * @internal
 */
export const REPL_SERVER_DEFAULT_PROMPT = 'famir > '

/**
 * Default greet banner content.
 *
 * @category ReplServer Service
 * @internal
 */
export const REPL_SERVER_DEFAULT_BANNER_GREET = `Welcome to Fake-Mirrors!`

/**
 * Default leave banner content.
 *
 * @category ReplServer Service
 * @internal
 */
export const REPL_SERVER_DEFAULT_BANNER_LEAVE = `So long!`

/**
 * Configuration for a Net repl-server.
 */
export interface NetReplServerConfig extends ConfigData {
  /** Listening address. */
  REPL_SERVER_ADDRESS: string
  /** Listening port. */
  REPL_SERVER_PORT: number
  /** Maximum number of concurrent clients. */
  REPL_SERVER_MAX_CLIENTS: number
  /** Socket timeout in milliseconds. */
  REPL_SERVER_SOCKET_TIMEOUT: number
  /** Whether to use ANSI colors in the REPL. */
  REPL_SERVER_USE_COLORS: boolean
}

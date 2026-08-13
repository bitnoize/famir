import { ConfigData } from '@famir/config'

/**
 * DI token for a repl-server implementation.
 */
export const REPL_SERVER = Symbol('ReplServer')

/**
 * Defines the public contract for a repl-server.
 *
 * The REPL (Read-Eval-Print-Loop) server provides an interactive
 * command-line interface for system administration and debugging.
 */
export interface ReplServer {
  /**
   * Starts the REPL server and begins accepting connections.
   *
   * @throws LifecycleError If the server cannot be started.
   */
  start(): Promise<void>

  /**
   * Stops the REPL server and closes all active connections.
   *
   * @throws LifecycleError If the server cannot be stopped.
   */
  stop(): Promise<void>
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
 * @internal
 */
export const REPL_SERVER_DEFAULT_PROMPT = 'famir > '

/**
 * Default greet banner content.
 *
 * @internal
 */
export const REPL_SERVER_DEFAULT_BANNER_GREET = `Welcome to Fake-Mirrors!`

/**
 * Default leave banner content.
 *
 * @internal
 */
export const REPL_SERVER_DEFAULT_BANNER_LEAVE = `So long!`

/**
 * Configuration for a Cli repl-server.
 */
export interface CliReplServerConfig extends ConfigData {
  /** Whether to use ANSI colors. */
  REPL_SERVER_USE_COLORS: boolean
}

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

/**
 * DI token
 * @category DI
 */
export const REPL_SERVER = Symbol('ReplServer')

/**
 * DI token
 * @category DI
 */
export const REPL_SERVER_ASSETS = Symbol('ReplServerAssets')

/**
 * DI token
 * @category DI
 */
export const REPL_SERVER_ROUTER = Symbol('ReplServerRouter')

/**
 * Represents a REPL server
 * @category none
 */
export interface ReplServer {
  /**
   * Start server
   */
  start(): Promise<void>

  /**
   * Stop server
   */
  stop(): Promise<void>
}

/**
 * REPL server api-call
 * @category none
 */
export type ReplServerApiCall = (data: unknown) => Promise<unknown>

/**
 * @category none
 * @internal
 */
export type ReplServerApiCalls = [string, ReplServerApiCall][]

/**
 * @category none
 * @internal
 */
export type ReplServerAssets = [string, string][]

/**
 * Cli REPL server config
 * @category none
 */
export interface CliReplServerConfig {
  REPL_SERVER_PROMPT: string
  REPL_SERVER_USE_COLORS: boolean
}

/**
 * @category none
 * @internal
 */
export interface CliReplServerOptions {
  prompt: string
  useColors: boolean
}

/**
 * Net REPL server config
 * @category none
 */
export interface NetReplServerConfig {
  REPL_SERVER_ADDRESS: string
  REPL_SERVER_PORT: number
  REPL_SERVER_MAX_CLIENTS: number
  REPL_SERVER_SOCKET_TIMEOUT: number
  REPL_SERVER_PROMPT: string
  REPL_SERVER_USE_COLORS: boolean
}

/**
 * @category none
 * @internal
 */
export interface NetReplServerOptions {
  address: string
  port: number
  maxClients: number
  socketTimeout: number
  prompt: string
  useColors: boolean
}

/**
 * @category none
 * @internal
 */
export const REPL_SERVER_BANNER_GREET = `Welcome to Famir!`

/**
 * @category none
 * @internal
 */
export const REPL_SERVER_BANNER_LEAVE = `So long!`

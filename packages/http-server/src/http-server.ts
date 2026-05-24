import { ConfigData } from '@famir/config'

/**
 * DI token for an http-server implementation.
 */
export const HTTP_SERVER = Symbol('HttpServer')

/**
 * Defines the public contract for an http-server.
 *
 * The server handles incoming HTTP requests and WebSocket connections,
 * processes them through a chain of middleware, and sends appropriate responses.
 */
export interface HttpServer {
  /**
   * Starts the server and begins accepting connections.
   *
   * @throws {@link BootstrapError} If the server cannot be started.
   */
  start(): Promise<void>

  /**
   * Stops the server and closes all active connections.
   *
   * @throws {@link BootstrapError} If the server cannot be stopped.
   */
  stop(): Promise<void>
}

/**
 * Configuration for a Native http-server.
 */
export interface NativeHttpServerConfig extends ConfigData {
  /** Listening address. */
  HTTP_SERVER_ADDRESS: string
  /** Listening port. */
  HTTP_SERVER_PORT: number
  /** Verbose logging. */
  HTTP_SERVER_VERBOSE: boolean
}

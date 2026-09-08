/**
 * DI token for an http-server implementation.
 *
 * @category HttpServer Service
 */
export const HTTP_SERVER = Symbol('HttpServer')

/**
 * Defines the public contract for an http-server.
 *
 * The server handles incoming HTTP requests and WebSocket connections,
 * processes them through a chain of middleware, and sends appropriate responses.
 *
 * @category HttpServer Service
 */
export interface HttpServer {
  /**
   * Starts the server and begins accepting connections.
   *
   * @throws LifecycleError If the server cannot be started.
   */
  start(): Promise<void>

  /**
   * Stops the server and closes all active connections.
   *
   * @throws LifecycleError If the server cannot be stopped.
   */
  stop(): Promise<void>
}

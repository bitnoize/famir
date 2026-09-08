/**
 * DI token for a repl-server implementation.
 *
 * @category ReplServer Service
 */
export const REPL_SERVER = Symbol('ReplServer')

/**
 * Defines the public contract for a repl-server.
 *
 * The REPL (Read-Eval-Print-Loop) server provides an interactive
 * command-line interface for system administration and debugging.
 *
 * @category ReplServer Service
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

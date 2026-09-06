/**
 * DI token for an edge-server implementation.
 *
 * @category EdgeServer Service
 */
export const EDGE_SERVER = Symbol('EdgeServer')

/**
 * Defines the public contract for an edge-server.
 *
 * @category EdgeServer Service
 */
export interface EdgeServer {
  upsertConfig(caddyfile: string): Promise<void>
  readConfig(): Promise<unknown>
  deleteConfig(): Promise<void>
  readUpstreams(): Promise<unknown>
}

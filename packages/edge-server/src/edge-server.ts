import { ConfigData } from '@famir/config'

/**
 * DI token for an edge-server implementation.
 */
export const EDGE_SERVER = Symbol('EdgeServer')

/**
 * Defines the public contract for an edge-server.
 */
export interface EdgeServer {
  upsertConfig(caddyfile: string): Promise<void>
  readConfig(): Promise<unknown>
  deleteConfig(): Promise<void>
  readUpstreams(): Promise<unknown>
}

/**
 * Configuration for a Caddy edge-server.
 */
export interface CaddyEdgeServerConfig extends ConfigData {
  /** Caddy admin API url. */
  EDGE_SERVER_API_URL: string
}

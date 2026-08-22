import { ConfigData } from '@famir/config'

/**
 * DI token for an edge-server implementation.
 */
export const EDGE_SERVER = Symbol('EdgeServer')

/**
 * Defines the public contract for an edge-server.
 */
export interface EdgeServer {
  getInfo(): Promise<EdgeServerInfo>
  loadConf(): Promise<void>
}

/**
 *
 */
export interface EdgeServerInfo {
  upstreams: object[]
}

/**
 * Configuration for a Caddy edge-server.
 */
export interface CaddyEdgeServerConfig extends ConfigData {
  /** Caddy admin API url. */
  EDGE_SERVER_API_URL: string
}

/**
 * Caddy edge-server upstream.
 *
 * @internal
 */
export interface CaddyEdgeServerUpstream {
  address: string
  num_requests: number
  fails: number
}

import { ConfigData } from '@famir/domain'

/**
 * Configuration for a Caddy edge-server.
 */
export interface CaddyEdgeServerConfig extends ConfigData {
  /** Caddy admin API url. */
  EDGE_SERVER_API_URL: string
}

import { ConfigData } from '@famir/domain'

/**
 * Configuration for a Native http-server.
 */
export interface NativeHttpServerConfig extends ConfigData {
  /** Listening address. */
  HTTP_SERVER_ADDRESS: string
  /** Listening port. */
  HTTP_SERVER_PORT: number
}

import { ConfigData } from '@famir/domain'

/**
 * Settings for an http-server.
 */
export interface HttpServerSettings {
  /** Error page content. */
  errorPage: string
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

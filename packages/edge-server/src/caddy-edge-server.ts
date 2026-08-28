import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { EdgeServerError } from './edge-server.error.js'
import { CaddyEdgeServerConfig, EDGE_SERVER, EdgeServer } from './edge-server.js'
import { caddyEdgeServerConfigSchema } from './edge-server.schemas.js'

/**
 * Options for a Caddy edge-server.
 */
interface CaddyEdgeServerOptions {
  apiUrl: string
}

/**
 * Caddy-based edge-server implementation.
 *
 * A Service that controls the Caddy server via admin API.
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - {@link Logger} via {@link LOGGER} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { EDGE_SERVER, EdgeServer, CaddyEdgeServer } from '@famir/edge-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register in DI container
 * CaddyEdgeServer.register(container)
 *
 * // Resolve from DI container
 * const edgeServer = container.resolve<EdgeServer>(EDGE_SERVER)
 *
 * // Get server info
 * const info = await edgeServer.getInfo()
 * console.log(info)
 *
 * ```
 */
export class CaddyEdgeServer implements EdgeServer {
  /**
   * Registers the edge-server as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<EdgeServer>(
      EDGE_SERVER,
      (c) =>
        new CaddyEdgeServer(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  /** Built edge-server options. */
  protected readonly options: CaddyEdgeServerOptions

  /**
   * Creates a new edge-server instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config,
    protected readonly logger: Logger
  ) {
    this.validator.addSchema('edge-server-config', caddyEdgeServerConfigSchema)

    const conf = this.config.get<CaddyEdgeServerConfig>('edge-server-config')
    this.options = this.buildOptions(conf)
  }

  /**
   * API call to upsert config.
   */
  async upsertConfig(caddyfile: string): Promise<void> {
    try {
      const url = new URL(`/load`, this.options.apiUrl)

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/caddyfile',
          'Origin': this.options.apiUrl,
        },
        body: caddyfile,
      })

      if (!res.ok) {
        throw EdgeServerError.create(`API upsert config failed`, {
          status: res.status,
        })
      }

      this.logger.info(`EdgeServer config upserted`)
    } catch (error) {
      throw EdgeServerError.wrap(error, {
        method: 'upsertConfig',
        params: { caddyfile },
      })
    }
  }

  /**
   * API call to read config.
   */
  async readConfig(): Promise<unknown> {
    try {
      const url = new URL(`/config/`, this.options.apiUrl)

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Origin: this.options.apiUrl,
        },
      })

      if (!res.ok) {
        throw EdgeServerError.create(`API read config failed`, {
          status: res.status,
        })
      }

      return await res.json()
    } catch (error) {
      throw EdgeServerError.wrap(error, {
        method: 'readConfig',
        params: {},
      })
    }
  }

  /**
   * API call to delete config.
   */
  async deleteConfig(): Promise<void> {
    try {
      const url = new URL(`/config/`, this.options.apiUrl)

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Origin: this.options.apiUrl,
        },
      })

      if (!res.ok) {
        throw EdgeServerError.create(`API delete config failed`, {
          status: res.status,
        })
      }
      this.logger.info(`EdgeServer config deleted`)
    } catch (error) {
      throw EdgeServerError.wrap(error, {
        method: 'deleteConfig',
        params: {},
      })
    }
  }

  /**
   * API call to read upstreams.
   */
  async readUpstreams(): Promise<unknown> {
    try {
      const url = new URL('/reverse_proxy/upstreams', this.options.apiUrl)

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Origin: this.options.apiUrl,
        },
      })

      if (!res.ok) {
        throw EdgeServerError.create(`API read upstreams failed`, {
          status: res.status,
        })
      }

      return await res.json()
    } catch (error) {
      throw EdgeServerError.wrap(error, {
        method: 'readUpstreams',
        params: {},
      })
    }
  }

  /**
   * Converts validated configuration to an edge-server options.
   */
  private buildOptions(conf: CaddyEdgeServerConfig): CaddyEdgeServerOptions {
    return {
      apiUrl: conf.EDGE_SERVER_API_URL,
    }
  }
}

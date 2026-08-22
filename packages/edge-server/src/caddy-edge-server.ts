import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { EdgeServerError } from './edge-server.error.js'
import {
  CaddyEdgeServerConfig,
  CaddyEdgeServerUpstream,
  EDGE_SERVER,
  EdgeServer,
  EdgeServerInfo,
} from './edge-server.js'
import {
  caddyEdgeServerConfigSchema,
  caddyEdgeServerUpstreamsSchema,
} from './edge-server.schemas.js'

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
    this.validator
      .addSchema('edge-server-config', caddyEdgeServerConfigSchema)
      .addSchema('edge-server-upstreams', caddyEdgeServerUpstreamsSchema)

    const conf = this.config.get<CaddyEdgeServerConfig>('edge-server-config')
    this.options = this.buildOptions(conf)
  }

  async getInfo(): Promise<EdgeServerInfo> {
    try {
      return {
        upstreams: await this.getCaddyUpstreams(),
      }
    } catch (error) {
      throw EdgeServerError.wrap(error, {
        method: 'getInfo',
        params: {},
      })
    }
  }

  async loadConf(): Promise<void> {
    try {
      console.log(`TODO!`)
    } catch (error) {
      throw EdgeServerError.wrap(error, {
        method: 'load',
        params: {},
      })
    }
  }

  /**
   * Validates data from a Caddy admin API against a registered JSON Schema.
   *
   * @typeParam T - The expected type of the data after validation.
   * @param schemaName - The name of the schema to validate against.
   * @param value - The data from edge server response.
   * @throws {@link EdgeServerError} If validation fails.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  protected validateData<T>(schemaName: string, value: unknown): asserts value is T {
    try {
      this.validator.assertSchema<T>(schemaName, value)
    } catch (error) {
      throw EdgeServerError.create(`Validate data failed`, null, error)
    }
  }

  /**
   * API call to receive Caddy upstreams.
   */
  private async getCaddyUpstreams(): Promise<CaddyEdgeServerUpstream[]> {
    const url = new URL('/reverse_proxy/upstreams', this.options.apiUrl)

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': this.options.apiUrl,
      },
    })

    if (!res.ok) {
      throw EdgeServerError.create(`Admin API call failed`, {
        status: res.status,
      })
    }

    const data: unknown = await res.json()

    this.validateData<CaddyEdgeServerUpstream[]>('edge-server-upstreams', data)

    return data
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

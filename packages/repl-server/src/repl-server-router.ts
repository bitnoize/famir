import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import {
  REPL_SERVER_ASSETS,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerApiCalls,
  ReplServerAssets,
} from './repl-server.js'

type ReplServerApiCallsMap = Map<string, ReplServerApiCall>

/**
 * Represents a REPL server router
 *
 * @category none
 */
export class ReplServerRouter {
  /**
   * Register dependency
   */
  static register(container: DIContainer, assets: ReplServerAssets) {
    container.registerSingleton<ReplServerAssets>(REPL_SERVER_ASSETS, () => assets)

    container.registerSingleton<ReplServerRouter>(
      REPL_SERVER_ROUTER,
      (c) => new ReplServerRouter(c.resolve(LOGGER), c.resolve(REPL_SERVER_ASSETS))
    )
  }

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): ReplServerRouter {
    return container.resolve(REPL_SERVER_ROUTER)
  }

  protected readonly apiCalls: ReplServerApiCallsMap = new Map()

  constructor(
    protected readonly logger: Logger,
    protected readonly assets: ReplServerAssets
  ) {
    this.logger.debug(`ReplServerRouter initialized`)
  }

  #isActive: boolean = false

  /**
   * Check if router is active
   */
  get isActive(): boolean {
    return this.#isActive
  }

  /**
   * Activate router
   */
  activate() {
    this.#isActive = true
  }

  /**
   * Get asset by name
   */
  getAsset(assetName: string): string | undefined {
    return this.assets.get(assetName)
  }

  /**
   * Build assets
   */
  buildAssets(): Record<string, string> {
    return Object.fromEntries(this.assets.entries())
  }

  /**
   * Add api-call
   */
  addApiCall(apiCallName: string, apiCall: ReplServerApiCall) {
    if (this.isActive) {
      throw new Error(`Router is active`)
    }

    if (this.apiCalls.has(apiCallName)) {
      throw new Error(`ApiCall already exists: ${apiCallName}`)
    }

    this.apiCalls.set(apiCallName, apiCall)

    this.logger.debug(`ReplServerRouter add apiCall: ${apiCallName}`)
  }

  /**
   * Get api-calls
   */
  getApiCalls(): ReplServerApiCalls {
    if (!this.isActive) {
      throw new Error(`Router not active`)
    }

    return Array.from(this.apiCalls.entries())
  }
}

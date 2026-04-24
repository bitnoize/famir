import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import {
  REPL_SERVER_ASSETS,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerApiCalls,
  ReplServerAssets,
} from './repl-server.js'

/**
 * Represents a REPL server router
 *
 * @category none
 */
export class ReplServerRouter {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
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

  protected readonly assets: Map<string, string> = new Map()
  protected readonly apiCalls: Map<string, ReplServerApiCall> = new Map()

  constructor(
    protected readonly logger: Logger,
    assets: ReplServerAssets
  ) {
    assets.forEach(([assetName, asset]) => {
      if (this.assets.has(assetName)) {
        throw new Error(`Duplicate asset: ${assetName}`)
      }

      this.assets.set(assetName, asset)
    })

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

  /**
   * Get asset by name
   */
  getAsset(assetName: string): string | undefined {
    return this.assets.get(assetName)
  }

  /**
   * Get asset names
   */
  getAssetNames(): string[] {
    return Array.from(this.assets.keys())
  }
}

import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import {
  REPL_SERVER_ASSETS,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerApiCalls,
  ReplServerAssets
} from './repl-server.js'

export class ReplServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<ReplServerRouter>(
      REPL_SERVER_ROUTER,
      (c) =>
        new ReplServerRouter(
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerAssets>(REPL_SERVER_ASSETS)
        )
    )
  }

  static resolve(container: DIContainer): ReplServerRouter {
    return container.resolve(REPL_SERVER_ROUTER)
  }

  protected readonly assets = new Map<string, string>()
  protected readonly apiCalls = new Map<string, ReplServerApiCall>()

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

  get isActive(): boolean {
    return this.#isActive
  }

  activate() {
    this.#isActive = true
  }

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

  getApiCalls(): ReplServerApiCalls {
    if (!this.isActive) {
      throw new Error(`Router not active`)
    }

    return Array.from(this.apiCalls.entries())
  }

  getAsset(assetName: string): string | undefined {
    return this.assets.get(assetName)
  }

  getAssetNames(): string[] {
    return Array.from(this.assets.keys())
  }
}

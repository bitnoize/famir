import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { ReplServerError } from './repl-server.error.js'
import { ReplServerApiCall, ReplServerApiCalls } from './repl-server.js'

export const REPL_SERVER_ROUTER = Symbol('ReplServerRouter')

export class ReplServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<ReplServerRouter>(
      REPL_SERVER_ROUTER,
      (c) => new ReplServerRouter(c.resolve<Logger>(LOGGER))
    )
  }

  static resolve(container: DIContainer): ReplServerRouter {
    return container.resolve(REPL_SERVER_ROUTER)
  }

  protected readonly apiCalls = new Map<string, ReplServerApiCall>()
  protected readonly assets = new Map<string, string>()

  constructor(protected readonly logger: Logger) {
    this.logger.debug(`ReplServerRouter initialized`)
  }

  #isActive: boolean = false

  get isActive(): boolean {
    return this.#isActive
  }

  activate() {
    this.#isActive = true
  }

  addApiCall(name: string, apiCall: ReplServerApiCall) {
    if (this.isActive) {
      throw new Error(`Router suddenly active`)
    }

    if (this.apiCalls.has(name)) {
      throw new Error(`ApiCall already exists: ${name}`)
    }

    this.apiCalls.set(name, apiCall)

    this.logger.debug(`ReplServerRouter add apiCall: ${name}`)
  }

  getApiCalls(): Readonly<ReplServerApiCalls> {
    if (!this.isActive) {
      throw new ReplServerError(`Router suddenly not active`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return Array.from(this.apiCalls.entries())
  }

  addAssets(entries: [string, string][]) {
    if (this.isActive) {
      throw new Error(`Router suddenly active`)
    }

    for (const [name, data] of entries) {
      if (this.assets.has(name)) {
        throw new Error(`Asset already exists: ${name}`)
      }

      this.assets.set(name, data)

      this.logger.debug(`ReplServerRouter add asset: ${name}`)
    }
  }

  getAsset(name: string): string | undefined {
    if (!this.isActive) {
      throw new ReplServerError(`Router suddenly not active`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return this.assets.get(name)
  }

  listAssets(): string[] {
    if (!this.isActive) {
      throw new ReplServerError(`Router suddenly not active`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return Array.from(this.assets.keys())
  }
}

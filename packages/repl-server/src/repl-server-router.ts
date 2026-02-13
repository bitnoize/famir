import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { ReplServerApiCall, ReplServerApiCalls } from './repl-server.js'

export const REPL_SERVER_ROUTER = Symbol('ReplServerRouter')

export class ReplServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<ReplServerRouter>(
      REPL_SERVER_ROUTER,
      (c) => new ReplServerRouter(c.resolve<Logger>(LOGGER))
    )
  }

  protected readonly registry = new Map<string, ReplServerApiCall>()

  constructor(protected readonly logger: Logger) {
    this.logger.debug(`ReplServerRouter initialized`)
  }

  register(name: string, apiCall: ReplServerApiCall) {
    if (this.registry.has(name)) {
      throw new Error(`ApiCall already registered: ${name}`)
    }

    this.registry.set(name, apiCall)

    this.logger.info(`ReplServerRouter register apiCall: ${name}`)
  }

  resolve(): ReplServerApiCalls {
    return Array.from(this.registry.entries())
  }

  reset() {
    this.registry.clear()
  }
}

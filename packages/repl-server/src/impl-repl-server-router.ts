import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerApiCalls,
  ReplServerRouter
} from '@famir/domain'

export class ImplReplServerRouter implements ReplServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<ReplServerRouter>(
      REPL_SERVER_ROUTER,
      (c) => new ImplReplServerRouter(c.resolve<Logger>(LOGGER))
    )
  }

  protected readonly registry = new Map<string, ReplServerApiCall>()

  constructor(protected readonly logger: Logger) {
    this.logger.debug(`ReplServerRouter initialized`)
  }

  register(name: string, apiCall: ReplServerApiCall) {
    if (this.registry.has(name)) {
      this.logger.error(`ReplServerRouter apiCall allready registered: ${name}`)
    } else {
      this.logger.info(`ReplServerRouter register apiCall: ${name}`)

      this.registry.set(name, apiCall)
    }
  }

  resolve(): ReplServerApiCalls {
    return Array.from(this.registry.entries())
  }

  reset() {
    this.registry.clear()
  }
}

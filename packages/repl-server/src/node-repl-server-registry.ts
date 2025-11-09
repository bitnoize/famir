import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_REGISTRY,
  ReplServerApiCall,
  ReplServerApiCalls,
  ReplServerRegistry
} from '@famir/domain'

export class NodeReplServerRegistry implements ReplServerRegistry {
  static inject(container: DIContainer) {
    container.registerSingleton<ReplServerRegistry>(
      REPL_SERVER_REGISTRY,
      (c) => new NodeReplServerRegistry(c.resolve<Logger>(LOGGER))
    )
  }

  protected readonly apiCalls: ReplServerApiCalls = {}

  constructor(protected readonly logger: Logger) {
    this.logger.debug(`ReplServerRegistry initialized`)
  }

  addApiCall(name: string, apiCall: ReplServerApiCall) {
    if (this.apiCalls[name]) {
      throw new Error(`ApiCall allready registered`)
    }

    this.apiCalls[name] = apiCall
  }

  getApiCalls(): ReplServerApiCalls {
    return this.apiCalls
  }

  getApiNames(): string[] {
    return Object.keys(this.apiCalls)
  }
}

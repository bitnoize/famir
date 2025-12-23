import { DIContainer } from '@famir/common'
import {
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerApiCalls,
  ReplServerRouter
} from '@famir/domain'

export class ImplReplServerRouter implements ReplServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<ReplServerRouter>(
      REPL_SERVER_ROUTER,
      () => new ImplReplServerRouter()
    )
  }

  protected readonly apiCalls: ReplServerApiCalls = {}

  addApiCall(name: string, apiCall: ReplServerApiCall) {
    if (this.apiCalls[name]) {
      throw new Error(`ApiCall '${name}' allready exists`)
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

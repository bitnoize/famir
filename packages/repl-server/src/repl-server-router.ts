import { DIContainer, serializeError } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerError,
  ReplServerRouter
} from '@famir/domain'

export class SimpleReplServerRouter implements ReplServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<ReplServerRouter>(
      REPL_SERVER_ROUTER,
      (c) => new SimpleReplServerRouter(c.resolve<Logger>(LOGGER))
    )
  }

  constructor(protected readonly logger: Logger) {
    this.logger.debug(`SimpleServerRouter initialized`)
  }

  private readonly registry = new Map<string, ReplServerApiCall>()

  register(name: string, apiCall: ReplServerApiCall) {
    if (this.registry.has(name)) {
      throw new Error(`ApiCall allready registered: ${name}`)
    }

    this.registry.set(name, apiCall)
  }

  resolve(): object {
    const api: Record<string, ReplServerApiCall> = {}

    this.registry.forEach((apiCall, name) => {
      api[name] = async (data: unknown): Promise<unknown> => {
        try {
          return await apiCall(data)
        } catch (error) {
          const raiseError = this.raiseError(error, name, data)

          this.logger.error(`ReplServer api error`, {
            error: serializeError(raiseError)
          })

          throw raiseError
        }
      }
    })

    return api
  }

  protected raiseError(error: unknown, name: string, data: unknown): ReplServerError {
    if (error instanceof ReplServerError) {
      error.context['name'] = name
      error.context['data'] = data

      return error
    } else {
      return new ReplServerError(`Server unknown error`, {
        cause: error,
        context: {
          name,
          data
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}

/*
 



  private readonly apiCalls = new Map<string, ReplServerApiCall>()

  addApiCall(name: string, apiCall: ReplServerApiCall) {
    if (this.registry.has(name)) {
      throw new Error(`ApiCall allready exists: ${name}`)
    }

    this.registry.set(name, apiCall)
  }

  getApiCalls(): Map<string, ReplServerApiCall> {
    return this.apiCalls
  }

  getApiNames(): string[] {
    return Object.keys(this.apiCalls)
  }

*/

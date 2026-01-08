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

  protected readonly registry = new Map<string, ReplServerApiCall>()

  constructor(protected readonly logger: Logger) {
    this.logger.debug(`ReplServerRouter initialized`)
  }

  register(name: string, apiCall: ReplServerApiCall) {
    if (this.registry.has(name)) {
      throw new Error(`ApiCall allready registered: ${name}`)
    }

    this.registry.set(name, apiCall)
  }

  resolve(): object {
    const obj: Record<string, ReplServerApiCall> = {}

    this.registry.forEach((apiCall, name) => {
      obj[name] = async (data: unknown): Promise<unknown> => {
        try {
          return await apiCall(data)
        } catch (error) {
          const raiseError = this.raiseError(error, name, data)

          this.logger.error(`ReplServer apiCall error`, {
            error: serializeError(raiseError)
          })

          throw raiseError
        }
      }
    })

    return obj
  }

  reset() {
    this.registry.clear()
  }

  protected raiseError(error: unknown, apiCall: string, data: unknown): ReplServerError {
    if (error instanceof ReplServerError) {
      error.context['apiCall'] = apiCall
      error.context['data'] = data

      return error
    } else {
      return new ReplServerError(`Server unknown error`, {
        cause: error,
        context: {
          apiCall,
          data
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}

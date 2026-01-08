import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerContext,
  HttpServerError,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER
} from '@famir/domain'

export class SimpleHttpServerRouter implements HttpServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpServerRouter>(
      HTTP_SERVER_ROUTER,
      (c) => new SimpleHttpServerRouter(c.resolve<Logger>(LOGGER))
    )
  }

  protected readonly registry = new Map<string, HttpServerMiddleware>()

  constructor(protected readonly logger: Logger) {
    this.logger.debug(`HttpServerRouter initialized`)
  }

  register(name: string, middleware: HttpServerMiddleware) {
    if (this.registry.has(name)) {
      throw new Error(`Middleware allready registered: ${name}`)
    }

    this.registry.set(name, middleware)
  }

  resolve(): (ctx: HttpServerContext) => Promise<void> {
    return async (ctx: HttpServerContext): Promise<void> => {
      let index = -1

      const entries = Array.from(this.registry.entries())

      const dispatch = async (idx: number): Promise<void> => {
        if (idx <= index) {
          throw new Error('Middleware next() called multiple times')
        }

        index = idx

        const entry = entries[idx]

        if (entry) {
          const [name, middleware] = entry

          try {
            await middleware(ctx, async () => {
              await dispatch(idx + 1)
            })
          } catch (error) {
            throw this.raiseError(error, name)
          }
        }
      }

      await dispatch(0)
    }
  }

  reset() {
    this.registry.clear()
  }

  protected raiseError(error: unknown, middleware: string): HttpServerError {
    if (error instanceof HttpServerError) {
      error.context['middleware'] = middleware

      return error
    } else {
      return new HttpServerError(`Server unknown error`, {
        cause: error,
        context: {
          middleware
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}

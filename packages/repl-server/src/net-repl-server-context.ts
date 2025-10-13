import { DIContainer, serializeError } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_CONTEXT,
  ReplServerContext,
  ReplServerContextHandler,
  ReplServerError
} from '@famir/domain'
import repl from 'node:repl'

export class NetReplServerContext implements ReplServerContext {
  static inject(container: DIContainer) {
    container.registerSingleton<ReplServerContext>(
      REPL_SERVER_CONTEXT,
      (c) => new NetReplServerContext(c.resolve<Logger>(LOGGER))
    )
  }

  private readonly _map = new Map<string, ReplServerContextHandler>()

  constructor(protected readonly logger: Logger) {
    this.logger.debug(`ReplServerContext initialized`)
  }

  applyTo(replServer: repl.REPLServer) {
    this._map.forEach((handler, name) => {
      Object.defineProperty(replServer.context, name, {
        configurable: false,
        enumerable: true,
        value: this.buildContextHandler(handler)
      })
    })
  }

  setHandler(name: string, handler: ReplServerContextHandler) {
    if (this._map.has(name)) {
      throw new Error(`Context handler '${name}' allready exists`)
    }

    this._map.set(name, handler)

    this.logger.debug(`ReplServerContext register handler`, {
      handler: name
    })
  }

  dump(): string[] {
    return [...this._map.keys()]
  }

  private buildContextHandler(handler: ReplServerContextHandler) {
    return async (data: unknown): Promise<unknown> => {
      try {
        return await handler(data)
      } catch (error) {
        if (error instanceof ReplServerError) {
          error.context['data'] = data

          this.logger.error(`ReplServer context error`, {
            error: serializeError(error)
          })

          throw error
        } else {
          this.logger.error(`ReplServer unhandled error`, {
            error: serializeError(error)
          })

          throw error
        }
      }
    }
  }
}

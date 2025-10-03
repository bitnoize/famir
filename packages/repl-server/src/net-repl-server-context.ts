import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_CONTEXT,
  ReplServerContext,
  ReplServerContextHandler
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
    this.logger.debug(
      {
        module: 'repl-server'
      },
      `ReplServerContext initialized`
    )
  }

  applyTo(replServer: repl.REPLServer) {
    this._map.forEach((handler, name) => {
      Object.defineProperty(replServer.context, name, {
        configurable: false,
        enumerable: true,
        value: async (data: unknown): Promise<unknown> => {
          try {
            return await handler(data)
          } catch (error) {
            return error
          }
        }
      })
    })
  }

  setHandler(name: string, handler: ReplServerContextHandler) {
    if (this._map.has(name)) {
      throw new Error(`Context handler '${name}' allready exists`)
    }

    this._map.set(name, handler)

    this.logger.debug(
      {
        module: 'repl-server',
        handler: {
          name
        }
      },
      `ReplServerContext register handler`
    )
  }

  dump(): string[] {
    return [...this._map.keys()]
  }
}

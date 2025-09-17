import { ReplServerContext, ReplServerContextHandler } from '@famir/domain'
import repl from 'node:repl'
import net from 'node:net'

export class NetReplServerContext implements ReplServerContext {
  private readonly _map = new Map<string, [string, ReplServerContextHandler]>()

  applyTo(replServer: repl.REPLServer) {
    this._map.forEach(([, handler], name) => {
      Object.defineProperty(replServer.context, name, {
        configurable: false,
        enumerable: true,
        value: async (dto: unknown): Promise<unknown> => {
          try {
            return await handler(dto)
          } catch (error) {
            return error
          }
        }
      })
    })
  }

  setHandler(name: string, description: string, handler: ReplServerContextHandler) {
    if (this._map.has(name)) {
      throw new Error(`Handler '${name}' allready exists`)
    }

    this._map.set(name, [description, handler])
  }

  dump(): Record<string, string> {
    const res: Record<string, string> = {}

    this._map.forEach(([description], name) => {
      res[name] = description
    })

    return res
  }
}

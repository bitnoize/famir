import repl from 'node:repl'
import { Context } from './repl-server.js'

export class NodeContext implements Context {
  private readonly _context = new Map<string, unknown>()

  applyTo(replServer: repl.REPLServer) {
    this._context.forEach((value, name) => {
      Object.defineProperty(replServer.context, name, {
        configurable: false,
        enumerable: true,
        value
      })
    })
  }

  addValue(name: string, value: unknown) {
    if (this._context.has(name)) {
      throw new Error(`Value '${name}' allready exists`)
    }

    this._context.set(name, value)
  }

  dump(): Record<string, unknown> {
    return Object.fromEntries(this._context)
  }
}

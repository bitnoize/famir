export interface ReplServer {
  listen(): Promise<void>
  close(): Promise<void>
}

export const REPL_SERVER = Symbol('ReplServer')

export type ReplServerContextHandler = (data: unknown) => Promise<unknown>

export interface ReplServerContext {
  applyTo(replServer: unknown): void
  setHandler(name: string, handler: ReplServerContextHandler): void
  dump(): string[]
}

export const REPL_SERVER_CONTEXT = Symbol('ReplServerContext')

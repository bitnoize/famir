export interface ReplServer {
  listen(): Promise<void>
  close(): Promise<void>
}

export type ReplServerContextHandler = (data: unknown) => Promise<unknown>

export interface ReplServerContext {
  applyTo(replServer: unknown): void
  setHandler(name: string, handler: ReplServerContextHandler): void
  dump(): string[]
}

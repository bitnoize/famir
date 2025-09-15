export interface ReplServer {
  listen(): Promise<void>
  close(): Promise<void>
}

export type ReplServerContextHandler = (dto: unknown) => Promise<unknown>

export interface ReplServerContext {
  applyTo(replServer: unknown): void
  setHandler(name: string, description: string, handler: ReplServerContextHandler): void
  dump(): Record<string, unknown>
}

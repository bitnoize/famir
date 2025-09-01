export interface ReplServerConfig {
  REPL_SERVER_ADDRESS: string
  REPL_SERVER_PORT: number
  REPL_SERVER_MAX_CONNECTIONS: number
  REPL_SERVER_SOCKET_TIMEOUT: number
  REPL_SERVER_PROMPT: string
  REPL_SERVER_USE_COLORS: boolean
}

export interface ReplServerOptions {
  address: string
  port: number
  maxConnections: number
  socketTimeout: number
  prompt: string
  useColors: boolean
}

export interface ReplServer {
  listen(): Promise<void>
  close(): Promise<void>
}

export type ContextHandler = (dto: unknown) => Promise<unknown>

export interface Context {
  applyTo(replServer: unknown): void
  setHandler(name: string, description: string, handler: ContextHandler): void
  dump(): Record<string, unknown>
}

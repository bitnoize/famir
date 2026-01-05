export const REPL_SERVER = Symbol('ReplServer')

export interface ReplServer {
  listen(): Promise<void>
  close(): Promise<void>
}

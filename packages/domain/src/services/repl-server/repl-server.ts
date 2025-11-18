export type ReplServerApiCall = (data: unknown) => Promise<unknown>
export type ReplServerApiCalls = Record<string, ReplServerApiCall>

export const REPL_SERVER = Symbol('ReplServer')

export interface ReplServer {
  listen(): Promise<void>
  close(): Promise<void>
}

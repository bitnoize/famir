export const REPL_SERVER = Symbol('ReplServer')

export interface ReplServer {
  listen(): Promise<void>
  close(): Promise<void>
}

export type ReplServerApiCall = (data: unknown) => Promise<unknown>

export type ReplServerApiCalls = [string, ReplServerApiCall][]

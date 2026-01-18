export const REPL_SERVER = Symbol('ReplServer')

export interface ReplServer {
  start(): Promise<void>
  stop(): Promise<void>
}

export type ReplServerApiCall = (data: unknown) => Promise<unknown>

export type ReplServerApiCalls = [string, ReplServerApiCall][]

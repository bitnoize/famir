import { ReplServerApiCalls, ReplServerApiCall } from './repl-server.js'

export interface ReplServerRegistry {
  addApiCall(name: string, apiCall: ReplServerApiCall): void
  getApiCalls(): ReplServerApiCalls
  getApiNames(): string[]
}

export const REPL_SERVER_REGISTRY = Symbol('ReplServerRegistry')

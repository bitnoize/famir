import { ReplServerApiCall, ReplServerApiCalls } from './repl-server.js'

export const REPL_SERVER_ROUTER = Symbol('ReplServerRouter')

export interface ReplServerRouter {
  addApiCall(name: string, apiCall: ReplServerApiCall): void
  getApiCalls(): ReplServerApiCalls
  getApiNames(): string[]
}

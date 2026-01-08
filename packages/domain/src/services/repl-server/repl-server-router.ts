export type ReplServerApiCall = (data: unknown) => Promise<unknown>

export const REPL_SERVER_ROUTER = Symbol('ReplServerRouter')

export interface ReplServerRouter {
  register(name: string, apiCall: ReplServerApiCall): void
  resolve(): object
  reset(): void
}

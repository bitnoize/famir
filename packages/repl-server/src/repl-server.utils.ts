import { ReplServerConfig, ReplServerOptions } from './repl-server.js'

export function buildOptions(data: ReplServerConfig): ReplServerOptions {
  return {
    address: data.REPL_SERVER_ADDRESS,
    port: data.REPL_SERVER_PORT,
    maxConnections: data.REPL_SERVER_MAX_CONNECTIONS,
    socketTimeout: data.REPL_SERVER_SOCKET_TIMEOUT,
    prompt: data.REPL_SERVER_PROMPT,
    useColors: data.REPL_SERVER_USE_COLORS
  }
}

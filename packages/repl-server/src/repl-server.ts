export interface CliReplServerConfig {
  REPL_SERVER_PROMPT: string
  REPL_SERVER_USE_COLORS: boolean
}

export interface CliReplServerOptions {
  prompt: string
  useColors: boolean
}

export interface NetReplServerConfig {
  REPL_SERVER_ADDRESS: string
  REPL_SERVER_PORT: number
  REPL_SERVER_MAX_CLIENTS: number
  REPL_SERVER_SOCKET_TIMEOUT: number
  REPL_SERVER_PROMPT: string
  REPL_SERVER_USE_COLORS: boolean
}

export interface NetReplServerOptions {
  address: string
  port: number
  maxClients: number
  socketTimeout: number
  prompt: string
  useColors: boolean
}

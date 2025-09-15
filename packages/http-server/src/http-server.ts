export interface HttpServerConfig {
  HTTP_SERVER_ADDRESS: string
  HTTP_SERVER_PORT: number
  HTTP_SERVER_BODY_LIMIT: number
}

export interface HttpServerOptions {
  address: string
  port: number
  bodyLimit: number
}

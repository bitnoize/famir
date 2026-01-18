export interface NodeHttpServerConfig {
  HTTP_SERVER_ADDRESS: string
  HTTP_SERVER_PORT: number
  HTTP_SERVER_ERROR_PAGE: string
}

export interface NodeHttpServerOptions {
  address: string
  port: number
  errorPage: string
}

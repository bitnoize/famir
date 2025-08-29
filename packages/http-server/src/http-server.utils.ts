import { HttpServerConfig, HttpServerOptions } from './http-server.js'

export function buildOptions(data: HttpServerConfig): HttpServerOptions {
  return {
    address: data.HTTP_SERVER_ADDRESS,
    port: data.HTTP_SERVER_PORT,
    bodyLimit: data.HTTP_SERVER_BODY_LIMIT
  }
}

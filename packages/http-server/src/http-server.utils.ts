import { ValidatorSchemas } from '@famir/domain'
import { filterSecrets } from '@famir/common'
import { HttpServerConfig, HttpServerOptions } from './http-server.js'

export const internalSchemas: ValidatorSchemas = {}

export function buildOptions(data: HttpServerConfig): HttpServerOptions {
  return {
    address: data.HTTP_SERVER_ADDRESS,
    port: data.HTTP_SERVER_PORT,
    bodyLimit: data.HTTP_SERVER_BODY_LIMIT
  }
}

export function filterOptionsSecrets(data: object) {
  return filterSecrets(data, [])
}

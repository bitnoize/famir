import { filterSecrets } from '@famir/common'
import { ValidatorSchemas } from '@famir/domain'
import { HttpClientConfig, HttpClientOptions } from './http-client.js'

export const internalSchemas: ValidatorSchemas = {}

export function buildOptions(data: HttpClientConfig): HttpClientOptions {
  return {
    bodyLimit: data.HTTP_CLIENT_BODY_LIMIT
  }
}

export function filterOptionsSecrets(data: object) {
  return filterSecrets(data, [])
}

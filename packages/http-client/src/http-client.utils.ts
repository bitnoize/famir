import { filterSecrets } from '@famir/common'
import { HttpClientConfig, HttpClientOptions } from './http-client.js'

export function buildOptions(data: HttpClientConfig): HttpClientOptions {
  return {
    bodyLimit: data.HTTP_CLIENT_BODY_LIMIT
  }
}

export function filterOptionsSecrets(data: object) {
  return filterSecrets(data, [])
}

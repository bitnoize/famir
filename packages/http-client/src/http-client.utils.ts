import { HttpClientConfig, HttpClientOptions } from './http-client.js'

export function buildOptions(data: HttpClientConfig): HttpClientOptions {
  return {
    bodyLimit: data.HTTP_CLIENT_BODY_LIMIT
  }
}

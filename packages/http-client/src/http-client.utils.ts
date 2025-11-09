import { arrayIncludes } from '@famir/common'
import { HTTP_RESPONSE_COOKIE_SAME_SITE, HttpResponseCookieSameSite } from '@famir/domain'
import { HttpClientConfig, HttpClientOptions } from './http-client.js'

export function buildOptions(data: HttpClientConfig): HttpClientOptions {
  return {
    bodyLimit: data.HTTP_CLIENT_BODY_LIMIT
  }
}

export function parseCookieSameSite(
  value: string | undefined
): HttpResponseCookieSameSite | undefined {
  if (value == null) {
    return undefined
  }

  value = value.toLowerCase()

  const isKnownValue = arrayIncludes(HTTP_RESPONSE_COOKIE_SAME_SITE, value)

  if (!isKnownValue) {
    return undefined
  }

  return value as HttpResponseCookieSameSite
}

import { MessageHeader, MessageRequestCookie } from '@famir/domain'

export const FILTER_REQUEST_HEADERS: RegExp[] = [
  /^Host$/i,
  /^Cookie$/i,
  /^Connection$/i,
  /^Keep-Alive$/i,
  /^Accept-Encoding$/i,
  /^Transfer-Encoding$/i,
  /^TE$/i,
  /^Proxy-*/i,
  /^Upgrade$/i,
  /^Upgrade-Insecure-Requests$/i,
  /^Trailer$/i,
  /^Via$/i,
  /^X-Forwarded-/i
]

export const filterRequestHeader = (
  entry: [string, string | string[] | undefined]
): entry is [string, MessageHeader] => {
  const [name, value] = entry

  if (FILTER_REQUEST_HEADERS.some((regexp) => regexp.test(name))) {
    return false
  }

  return value != null
}

export const filterRequestCookie = (
  entry: [string, unknown]
): entry is [string, MessageRequestCookie] => {
  const [, value] = entry

  return value != null && typeof value === 'string'
}

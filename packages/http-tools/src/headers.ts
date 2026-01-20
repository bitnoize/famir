import { HttpHeader, HttpHeaders } from '@famir/domain'

export function getHeader(headers: HttpHeaders, name: string): string | undefined {
  name = name.toLowerCase()

  const value = headers[name]

  if (value == null) {
    return undefined
  }

  if (Array.isArray(value)) {
    return value[0] != null ? value[0] : undefined
  }

  return value
}

export function getHeaderArray(headers: HttpHeaders, name: string): string[] | undefined {
  name = name.toLowerCase()

  const value = headers[name]

  if (value == null) {
    return undefined
  }

  if (typeof value === 'string') {
    return [value]
  }

  return value
}

export function setHeader(headers: HttpHeaders, name: string, value: HttpHeader | undefined) {
  name = name.toLowerCase()

  headers[name] = value
}

export function setHeaders(headers: HttpHeaders, newHeaders: HttpHeaders) {
  Object.entries(newHeaders).forEach(([name, value]) => {
    setHeader(headers, name, value)
  })
}

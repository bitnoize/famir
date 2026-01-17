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

function testStatusRange(status: number, min: number, max: number): boolean {
  return status >= min && status < max
}

export function isStatusInformation(status: number): boolean {
  return testStatusRange(status, 100, 200)
}

export function isStatusSuccess(status: number): boolean {
  return testStatusRange(status, 200, 300)
}

export function isStatusRedirect(status: number): boolean {
  return testStatusRange(status, 300, 400)
}

export function isStatusClientError(status: number): boolean {
  return testStatusRange(status, 400, 500)
}

export function isStatusServerError(status: number): boolean {
  return testStatusRange(status, 500, 600)
}

export function isStatusUnknown(status: number): boolean {
  return !testStatusRange(status, 100, 600)
}

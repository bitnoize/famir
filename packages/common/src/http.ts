export const HTTP_TYPES = [
  'normal-simple',
  'normal-stream-request',
  'normal-stream-response',
  'websocket'
] as const
export type HttpType = (typeof HTTP_TYPES)[number]

export const HTTP_METHODS = ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const
export type HttpMethod = (typeof HTTP_METHODS)[number]

export interface HttpUrl {
  protocol: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
}

export type HttpHeader = string | string[]
export type HttpHeaders = Record<string, HttpHeader | undefined>
export type HttpStrictHeaders = Record<string, HttpHeader>

export type HttpBody = Buffer
export type HttpText = string
export type HttpJson = NonNullable<unknown>

export type HttpConnection = Record<string, number | string | null | undefined>
export type HttpPayload = Record<string, unknown>
export type HttpError = readonly [object, ...string[]]

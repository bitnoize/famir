/**
 * @category none
 * @internal
 */
export const HTTP_TYPES_NORMAL = [
  'normal-simple',
  'normal-stream-request',
  'normal-stream-response',
] as const

/**
 * @category none
 * @internal
 */
export const HTTP_TYPES_WEBSOCKET = ['websocket'] as const

/**
 * @category none
 * @internal
 */
export const HTTP_TYPES = [...HTTP_TYPES_NORMAL, ...HTTP_TYPES_WEBSOCKET] as const

/**
 * @category none
 */
export type HttpType = (typeof HTTP_TYPES)[number]

/**
 * @category none
 * @internal
 */
export const HTTP_METHODS = ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const

/**
 * @category none
 */
export type HttpMethod = (typeof HTTP_METHODS)[number]

/**
 * @category none
 */
export interface HttpUrl {
  protocol: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
}

/**
 * @category none
 */
export type HttpHeader = string | string[]

/**
 * @category none
 */
export type HttpHeaders = Record<string, HttpHeader | undefined>

/**
 * @category none
 */
export type HttpStrictHeaders = Record<string, HttpHeader>

/**
 * @category none
 */
export type HttpBody = Buffer

/**
 * @category none
 */
export type HttpText = string

/**
 * @category none
 */
export type HttpJson = NonNullable<unknown>

/**
 * @category none
 */
export type HttpConnection = Record<string, number | string | null | undefined>

/**
 * @category none
 */
export type HttpPayload = Record<string, unknown>

/**
 * @category none
 */
export type HttpError = readonly [object, ...string[]]

/**
 * @category none
 */
export type HttpQueryString = Record<string, unknown>

/**
 * @category none
 */
export interface HttpContentType {
  type: string
  parameters: Record<string, string>
}

/**
 * @category none
 */
export type HttpCookie = string

/**
 * @category none
 */
export type HttpCookies = Record<string, HttpCookie | undefined>

/**
 * @category none
 */
export interface HttpSetCookie {
  value: string
  expires?: number
  maxAge?: number
  path?: string
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: string
}

/**
 * @category none
 */
export type HttpSetCookies = Record<string, HttpSetCookie | undefined>

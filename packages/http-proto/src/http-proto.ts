/**
 * Available values for normal HTTP types.
 *
 * @category none
 * @internal
 */
export const HTTP_TYPES_NORMAL = [
  'normal-simple',
  'normal-stream-request',
  'normal-stream-response',
] as const

/**
 * Available values for websocket HTTP types.
 *
 * @category none
 * @internal
 */
export const HTTP_TYPES_WEBSOCKET = ['websocket'] as const

/**
 * Available values for all supported HTTP types.
 *
 * @category none
 * @internal
 */
export const HTTP_TYPES = [...HTTP_TYPES_NORMAL, ...HTTP_TYPES_WEBSOCKET] as const

/**
 * Represents a HTTP type.
 *
 * @category none
 */
export type HttpType = (typeof HTTP_TYPES)[number]

/**
 * Available values for all supported HTTP methods.
 *
 * @category none
 * @internal
 */
export const HTTP_METHODS = ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const

/**
 * Represents a HTTP method.
 *
 * @category none
 */
export type HttpMethod = (typeof HTTP_METHODS)[number]

/**
 * Parsed URL components.
 *
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
 * Single header value.
 *
 * @category none
 */
export type HttpHeader = string | string[]

/**
 * Headers data.
 *
 * @category none
 */
export type HttpHeaders = Record<string, HttpHeader | undefined>

/**
 * Strict headers data.
 *
 * @category none
 */
export type HttpStrictHeaders = Record<string, HttpHeader>

/**
 * Body binary data.
 *
 * @category none
 */
export type HttpBody = Buffer

/**
 * Parsed body plain text data.
 *
 * @category none
 */
export type HttpText = string

/**
 * Parsed body JSON data.
 *
 * @category none
 */
export type HttpJson = NonNullable<object | unknown[]>

/**
 * Parsed connection data.
 *
 * @category none
 */
export type HttpConnection = Record<string, number | string | null | undefined>

/**
 * Parsed payload data.
 *
 * @category none
 */
export type HttpPayload = Record<string, unknown>

/**
 * Single processing error.
 *
 * @category none
 */
export type HttpError = [object, string[]]

/**
 * Query string parameters.
 *
 * @category none
 */
export type HttpQueryString = Record<string, unknown>

/**
 * Parsed Content-Type header.
 *
 * @category none
 */
export interface HttpContentType {
  type: string
  parameters: Record<string, string>
}

/**
 * Single cookie value.
 *
 * @category none
 */
export type HttpCookie = string

/**
 * Parsed Cookie header.
 *
 * @category none
 */
export type HttpCookies = Record<string, HttpCookie | undefined>

/**
 * Single set-cookie value.
 *
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
 * Parsed Set-Cookie header.
 *
 * @category none
 */
export type HttpSetCookies = Record<string, HttpSetCookie | undefined>

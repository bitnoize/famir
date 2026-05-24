/**
 * Available normal HTTP operation types.
 *
 * @internal
 */
export const HTTP_TYPES_NORMAL = [
  'normal-simple',
  'normal-stream-request',
  'normal-stream-response',
] as const

/**
 * Available WebSocket HTTP operation types.
 *
 * @internal
 */
export const HTTP_TYPES_WEBSOCKET = ['websocket'] as const

/**
 * Union of all supported HTTP operation types.
 *
 * @internal
 */
export const HTTP_TYPES = [...HTTP_TYPES_NORMAL, ...HTTP_TYPES_WEBSOCKET] as const

/**
 * Union type of all supported HTTP operation types.
 */
export type HttpType = (typeof HTTP_TYPES)[number]

/**
 * Available values for all supported HTTP methods.
 *
 * @internal
 */
export const HTTP_METHODS = ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const

/**
 * Type of all supported HTTP methods.
 */
export type HttpMethod = (typeof HTTP_METHODS)[number]

/**
 * Components of a parsed HTTP URL.
 */
export interface HttpUrl {
  /** The URL protocol. */
  protocol: string
  /** The hostname of the URL. */
  hostname: string
  /** The port number. */
  port: string
  /** The URL path. */
  pathname: string
  /** The URL query string. */
  search: string
  /** The URL fragment. */
  hash: string
}

/**
 * A single HTTP header value, which can be a string or an array of strings.
 */
export type HttpHeader = string | string[]

/**
 * HTTP headers as a record with optional values.
 */
export type HttpHeaders = Record<string, HttpHeader | undefined>

/**
 * HTTP headers as a record with required values.
 */
export type HttpStrictHeaders = Record<string, HttpHeader>

/**
 * Binary HTTP body data.
 */
export type HttpBody = Buffer

/**
 * Plain text HTTP body.
 */
export type HttpText = string

/**
 * JSON-serializable HTTP body.
 */
export type HttpJson = NonNullable<object | unknown[]>

/**
 * HTTP connection details.
 */
export type HttpConnection = Record<string, number | string | null | undefined>

/**
 * HTTP payload data.
 */
export type HttpPayload = Record<string, unknown>

/**
 * HTTP processing error.
 */
export type HttpError = [object, string[]]

/**
 * HTTP query-string parameters.
 */
export type HttpQueryString = Record<string, unknown>

/**
 * Parsed HTTP Content-Type header.
 */
export interface HttpContentType {
  /** The media type. */
  type: string
  /** The parameters of the Content-Type. */
  parameters: Record<string, string>
}

/**
 * A single HTTP cookie value as a string.
 */
export type HttpCookie = string

/**
 * Parsed HTTP Cookie header.
 */
export type HttpCookies = Record<string, HttpCookie | undefined>

/**
 * A single HTTP Set-Cookie value.
 */
export interface HttpSetCookie {
  /** The cookie value. */
  value: string
  /** The cookie expiration timestamp in milliseconds. */
  expires?: number
  /** The cookie max age in seconds. */
  maxAge?: number
  /** The cookie path. */
  path?: string
  /** The cookie domain. */
  domain?: string
  /** Whether the cookie is secure. */
  secure?: boolean
  /** Whether the cookie is HTTP-only. */
  httpOnly?: boolean
  /** The SameSite attribute value. */
  sameSite?: string
}

/**
 * Parsed HTTP Set-Cookie header.
 */
export type HttpSetCookies = Record<string, HttpSetCookie | undefined>

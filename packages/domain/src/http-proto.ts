/**
 * Available normal HTTP operation types.
 *
 * @category HttpProto
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
 * @category HttpProto
 * @internal
 */
export const HTTP_TYPES_WEBSOCKET = ['websocket'] as const

/**
 * Union of all supported HTTP operation types.
 *
 * @category HttpProto
 * @internal
 */
export const HTTP_TYPES = [...HTTP_TYPES_NORMAL, ...HTTP_TYPES_WEBSOCKET] as const

/**
 * Union type of all supported HTTP operation types.
 *
 * @category HttpProto
 */
export type HttpType = (typeof HTTP_TYPES)[number]

/**
 * Available values for all supported HTTP methods.
 *
 * @category HttpProto
 * @internal
 */
export const HTTP_METHODS = ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const

/**
 * Type of all supported HTTP methods.
 *
 * @category HttpProto
 */
export type HttpMethod = (typeof HTTP_METHODS)[number]

/**
 * Components of a parsed HTTP URL.
 *
 * @category HttpProto
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
 *
 * @category HttpProto
 */
export type HttpHeader = string | string[]

/**
 * HTTP headers as a record with optional values.
 *
 * @category HttpProto
 */
export type HttpHeaders = Record<string, HttpHeader | undefined>

/**
 * HTTP headers as a record with required values.
 *
 * @category HttpProto
 */
export type HttpStrictHeaders = Record<string, HttpHeader>

/**
 * Binary HTTP body data.
 *
 * @category HttpProto
 */
export type HttpBody = Buffer

/**
 * Plain text HTTP body.
 *
 * @category HttpProto
 */
export type HttpText = string

/**
 * JSON-serializable HTTP body.
 *
 * @category HttpProto
 */
export type HttpJson = NonNullable<object | unknown[]>

/**
 * HTTP connection details.
 *
 * @category HttpProto
 */
export type HttpConnection = Record<string, number | string | null | undefined>

/**
 * HTTP payload data.
 *
 * @category HttpProto
 */
export type HttpPayload = Record<string, unknown>

/**
 * HTTP processing error.
 *
 * @category HttpProto
 */
export type HttpError = [object, string[]]

/**
 * HTTP query-string parameters.
 *
 * @category HttpProto
 */
export type HttpQueryString = Record<string, unknown>

/**
 * Parsed HTTP Content-Type header.
 *
 * @category HttpProto
 */
export interface HttpContentType {
  /** The media type. */
  type: string
  /** The parameters of the Content-Type. */
  parameters: Record<string, string>
}

/**
 * A single HTTP cookie value as a string.
 *
 * @category HttpProto
 */
export type HttpCookie = string

/**
 * Parsed HTTP Cookie header.
 *
 * @category HttpProto
 */
export type HttpCookies = Record<string, HttpCookie | undefined>

/**
 * A single HTTP Set-Cookie value.
 *
 * @category HttpProto
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
 *
 * @category HttpProto
 */
export type HttpSetCookies = Record<string, HttpSetCookie | undefined>

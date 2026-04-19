/**
 * @category HTTP
 * @internal
 */
export const HTTP_TYPES_NORMAL = [
  'normal-simple',
  'normal-stream-request',
  'normal-stream-response',
] as const

/**
 * @category HTTP
 * @internal
 */
export const HTTP_TYPES_WEBSOCKET = ['websocket'] as const

/**
 * @category HTTP
 * @internal
 */
export const HTTP_TYPES = [...HTTP_TYPES_NORMAL, ...HTTP_TYPES_WEBSOCKET] as const

/**
 * @category HTTP
 */
export type HttpType = (typeof HTTP_TYPES)[number]

/**
 * @category HTTP
 * @internal
 */
export const HTTP_METHODS = ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const

/**
 * @category HTTP
 */
export type HttpMethod = (typeof HTTP_METHODS)[number]

/**
 * @category HTTP
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
 * @category HTTP
 */
export type HttpHeader = string | string[]

/**
 * @category HTTP
 */
export type HttpHeaders = Record<string, HttpHeader | undefined>

/**
 * @category HTTP
 */
export type HttpStrictHeaders = Record<string, HttpHeader>

/**
 * @category HTTP
 */
export type HttpBody = Buffer

/**
 * @category HTTP
 */
export type HttpText = string

/**
 * @category HTTP
 */
export type HttpJson = NonNullable<unknown>

/**
 * @category HTTP
 */
export type HttpConnection = Record<string, number | string | null | undefined>

/**
 * @category HTTP
 */
export type HttpPayload = Record<string, unknown>

/**
 * @category HTTP
 */
export type HttpError = readonly [object, ...string[]]

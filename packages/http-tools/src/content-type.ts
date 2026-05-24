/**
 * Available values for Content-Type names.
 *
 * @internal
 */
export const HTTP_CONTENT_TYPE_NAMES = [
  'text',
  'html',
  'css',
  'javascript',
  'json',
  'xml',
  'urlEncoded',
] as const

/**
 * Type for Content-Type name.
 *
 * @internal
 */
export type HttpContentTypeName = (typeof HTTP_CONTENT_TYPE_NAMES)[number]

/**
 * Dictionary for grouping Content-Types.
 *
 * @internal
 */
export type HttpContentTypes = Record<HttpContentTypeName, string[]>

/**
 * Parse Content-Type object from a string.
 *
 * @internal
 */
export { parse as parseContentType } from 'content-type'

/**
 * Format Content-Type object to a string.
 *
 * @internal
 */
export { format as formatContentType } from 'content-type'

/**
 * @category none
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
 * @category none
 * @internal
 */
export type HttpContentTypeName = (typeof HTTP_CONTENT_TYPE_NAMES)[number]

/**
 * @category none
 * @internal
 */
export type HttpContentTypes = Record<HttpContentTypeName, string[]>

/**
 * @category none
 * @internal
 */
export { parse as parseContentType } from 'content-type'

/**
 * @category none
 * @internal
 */
export { format as formatContentType } from 'content-type'

import { HttpContentType } from '@famir/http-proto'
import contenttype from 'content-type'

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
export function parseContentType(value: string): HttpContentType {
  return contenttype.parse(value.trim())
}

/**
 * @category none
 * @internal
 */
export function formatContentType(contentType: HttpContentType) {
  return contenttype.format(contentType)
}

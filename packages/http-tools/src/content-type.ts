import contenttype from 'content-type'

/**
 * Represents a content-type
 * @category Utils
 */
export interface HttpContentType {
  type: string
  parameters: Record<string, string>
}

/**
 * Content-type names
 * @category Utils
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
 * Content-type name
 * @category Utils
 */
export type HttpContentTypeName = (typeof HTTP_CONTENT_TYPE_NAMES)[number]

/**
 * Content-type types
 * @category Utils
 */
export type HttpContentTypes = Record<HttpContentTypeName, string[]>

/**
 * Parse content-type
 * @category Utils
 */
export function parseContentType(value: string): HttpContentType {
  return contenttype.parse(value.trim())
}

/**
 * Format content-type
 * @category Utils
 */
export function formatContentType(contentType: HttpContentType) {
  return contenttype.format(contentType)
}

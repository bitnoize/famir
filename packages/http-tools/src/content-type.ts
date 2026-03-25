import contenttype from 'content-type'

export interface HttpContentType {
  type: string
  parameters: Record<string, string>
}

export const HTTP_CONTENT_TYPE_NAMES = [
  'text',
  'html',
  'css',
  'javascript',
  'json',
  'xml',
  'urlEncoded'
] as const
export type HttpContentTypeName = (typeof HTTP_CONTENT_TYPE_NAMES)[number]
export type HttpContentTypes = Record<HttpContentTypeName, string[]>

export function parseContentType(value: string): HttpContentType {
  return contenttype.parse(value.trim())
}

export function formatContentType(contentType: HttpContentType) {
  return contenttype.format(contentType)
}

import contenttype from 'content-type'

export interface HttpContentType {
  type: string
  parameters: Record<string, string>
}

export function parseContentType(value: string): HttpContentType {
  return contenttype.parse(value.trim())
}

export function formatContentType(contentType: HttpContentType) {
  return contenttype.format(contentType)
}

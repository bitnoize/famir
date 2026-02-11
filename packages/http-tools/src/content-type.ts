import { HttpContentType } from '@famir/domain'
import { format, parse } from 'content-type'

export function parseContentType(value: string): HttpContentType {
  return parse(value.trim())
}

export function formatContentType(contentType: HttpContentType) {
  return format(contentType)
}

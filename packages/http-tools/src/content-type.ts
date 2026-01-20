import { HttpContentType, HttpHeaders } from '@famir/domain'
import contenttype from 'content-type'
import { getHeader, setHeader } from './headers.js'

export function getContentType(headers: HttpHeaders): HttpContentType {
  const value = getHeader(headers, 'Content-Type') ?? ''
  return contenttype.parse(value)
}

export function setContentType(headers: HttpHeaders, contentType: HttpContentType) {
  const value = contenttype.format(contentType)
  setHeader(headers, 'Content-Type', value)
}

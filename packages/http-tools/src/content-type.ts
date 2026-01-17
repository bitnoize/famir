import { HttpContentType, HttpHeaders } from '@famir/domain'
import contentTypeLib from 'content-type'
import { getHeader, setHeader } from './headers.js'

export function getContentType(headers: HttpHeaders): HttpContentType {
  const value = getHeader(headers, 'Content-Type') ?? ''

  return contentTypeLib.parse(value)
}

export function setContentType(headers: HttpHeaders, contentType: HttpContentType) {
  const value = contentTypeLib.format(contentType)

  setHeader(headers, 'Content-Type', value)
}

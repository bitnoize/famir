import { HttpBody, HttpHeaders } from '@famir/domain'

export interface OrdinaryRequestData {
  proxy: string
  method: string
  url: string
  requestHeaders: HttpHeaders
  requestBody: HttpBody
  connectTimeout: number
  ordinaryTimeout: number
  responseBodyLimit: number
}

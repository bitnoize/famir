import { HttpBody, HttpHeaders, HttpMethod } from '@famir/http-tools'

export interface ForwardStreamResponseData {
  proxy: string
  method: HttpMethod
  url: string
  requestHeaders: HttpHeaders
  requestBody: HttpBody
  connectTimeout: number
  timeout: number
  headersSizeLimit: number
}

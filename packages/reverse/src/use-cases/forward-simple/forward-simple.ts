import { HttpBody, HttpHeaders, HttpMethod } from '@famir/http-tools'

export interface ForwardSimpleData {
  proxy: string
  method: HttpMethod
  url: string
  requestHeaders: HttpHeaders
  requestBody: HttpBody
  connectTimeout: number
  timeout: number
  headersSizeLimit: number
  bodySizeLimit: number
}

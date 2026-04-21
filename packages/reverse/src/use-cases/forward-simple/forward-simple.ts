import { HttpBody, HttpHeaders, HttpMethod } from '@famir/http-proto'

export const FORWARD_SIMPLE_USE_CASE = Symbol('ForwardSimpleUseCase')

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

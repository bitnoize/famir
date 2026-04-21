import { HttpBody, HttpHeaders, HttpMethod } from '@famir/http-proto'

export const FORWARD_STREAM_RESPONSE_USE_CASE = Symbol('ForwardStreamResponseUseCase')

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

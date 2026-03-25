import { HttpHeaders, HttpMethod } from '@famir/http-tools'
import type { Readable } from 'node:stream'

export const FORWARD_STREAM_REQUEST_USE_CASE = Symbol('ForwardStreamRequestUseCase')

export interface ForwardStreamRequestData {
  proxy: string
  method: HttpMethod
  url: string
  requestHeaders: HttpHeaders
  requestStream: Readable
  connectTimeout: number
  timeout: number
  headersSizeLimit: number
  bodySizeLimit: number
}

import { HttpBody, HttpClientError, HttpHeaders, HttpMethod } from '@famir/domain'
import type { PassThrough, Readable } from 'node:stream'

/**
 * Base state for an HTTP interaction.
 *
 * @internal
 */
export interface HttpClientBaseState {
  error: HttpClientError | null
  settled: boolean
  proxy: string
  method: HttpMethod
  url: string
  requestHeaders: HttpHeaders
  responseHeaders: Buffer[]
  connectTimeout: number
  timeout: number
  headersSizeLimit: number
}

/**
 * State for a simple request with a simple response.
 *
 * @internal
 */
export interface HttpClientSimpleState extends HttpClientBaseState {
  requestBody: HttpBody
  responseBody: Buffer[]
  bodySizeLimit: number
}

/**
 * State for a streaming request with a simple response.
 *
 * @internal
 */
export interface HttpClientStreamRequestState extends HttpClientBaseState {
  requestStream: Readable
  responseBody: Buffer[]
  bodySizeLimit: number
}

/**
 * State for a simple request with a streaming response.
 *
 * @internal
 */
export interface HttpClientStreamResponseState extends HttpClientBaseState {
  requestBody: HttpBody
  responseStream: PassThrough
}

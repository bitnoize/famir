import { HttpBody, HttpConnection, HttpHeaders, HttpMethod } from '@famir/http-tools'
import type { PassThrough, Readable } from 'node:stream'
import { HttpClientError } from './http-client.error.js'

export const HTTP_CLIENT = Symbol('HttpClient')

export interface HttpClient {
  simple(
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    connectTimeout: number,
    timeout: number,
    headersSizeLimit: number,
    bodySizeLimit: number
  ): Promise<HttpClientSimpleResult | HttpClientErrorResult>
  streamRequest(
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestStream: Readable,
    connectTimeout: number,
    timeout: number,
    headersSizeLimit: number,
    bodySizeLimit: number
  ): Promise<HttpClientSimpleResult | HttpClientErrorResult>
  streamResponse(
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    connectTimeout: number,
    timeout: number,
    headersSizeLimit: number
  ): Promise<HttpClientStreamResult | HttpClientErrorResult>
}

export interface HttpClientBaseState {
  error: HttpClientError | null
  isResolved: boolean
  proxy: string
  method: HttpMethod
  url: string
  requestHeaders: HttpHeaders
  responseHeaders: Buffer[]
  connectTimeout: number
  timeout: number
  headersSizeLimit: number
}

export interface HttpClientSimpleState extends HttpClientBaseState {
  requestBody: HttpBody
  responseBody: Buffer[]
  bodySizeLimit: number
}

export interface HttpClientStreamRequestState extends HttpClientBaseState {
  requestStream: Readable
  responseBody: Buffer[]
  bodySizeLimit: number
}

export interface HttpClientStreamResponseState extends HttpClientBaseState {
  requestBody: HttpBody
  responseStream: PassThrough
}

export interface HttpClientErrorResult {
  readonly error: HttpClientError
  readonly connection: HttpConnection
}

export interface HttpClientBaseResult {
  readonly error: null
  readonly status: number
  readonly responseHeaders: HttpHeaders
  readonly connection: HttpConnection
}

export interface HttpClientSimpleResult extends HttpClientBaseResult {
  readonly responseBody: HttpBody
}

export interface HttpClientStreamResult extends HttpClientBaseResult {
  readonly responseStream: Readable
}

export interface CurlHttpClientConfig {
  HTTP_CLIENT_VERBOSE: boolean
}

export interface CurlHttpClientOptions {
  verbose: boolean
}

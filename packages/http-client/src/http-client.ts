import { HttpBody, HttpConnection, HttpHeaders, HttpMethod } from '@famir/http-proto'
import type { PassThrough, Readable } from 'node:stream'
import { HttpClientError } from './http-client.error.js'

/**
 * @category none
 * @internal
 */
export const HTTP_CLIENT = Symbol('HttpClient')

/**
 * Represents a HTTP client
 *
 * @category none
 */
export interface HttpClient {
  /**
   * Simple HTTP request and response
   */
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

  /**
   * Streaming HTTP request and simple response
   */
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

  /**
   * Simple HTTP request and streaming response
   */
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

/**
 * @category none
 * @internal
 */
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

/**
 * @category none
 * @internal
 */
export interface HttpClientSimpleState extends HttpClientBaseState {
  requestBody: HttpBody
  responseBody: Buffer[]
  bodySizeLimit: number
}

/**
 * @category none
 * @internal
 */
export interface HttpClientStreamRequestState extends HttpClientBaseState {
  requestStream: Readable
  responseBody: Buffer[]
  bodySizeLimit: number
}

/**
 * @category none
 * @internal
 */
export interface HttpClientStreamResponseState extends HttpClientBaseState {
  requestBody: HttpBody
  responseStream: PassThrough
}

/**
 * @category none
 */
export interface HttpClientErrorResult {
  readonly error: HttpClientError
  readonly connection: HttpConnection
}

/**
 * @category none
 * @internal
 */
export interface HttpClientBaseResult {
  readonly error: null
  readonly status: number
  readonly responseHeaders: HttpHeaders
  readonly connection: HttpConnection
}

/**
 * @category none
 */
export interface HttpClientSimpleResult extends HttpClientBaseResult {
  readonly responseBody: HttpBody
}

/**
 * @category none
 */
export interface HttpClientStreamResult extends HttpClientBaseResult {
  readonly responseStream: Readable
}

/**
 * @category none
 */
export interface CurlHttpClientConfig {
  HTTP_CLIENT_VERBOSE: boolean
}

/**
 * @category none
 * @internal
 */
export interface CurlHttpClientOptions {
  verbose: boolean
}

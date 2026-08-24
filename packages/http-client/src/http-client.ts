import { HttpBody, HttpConnection, HttpHeaders, HttpMethod } from '@famir/http-proto'
import type { PassThrough, Readable } from 'node:stream'
import { HttpClientError } from './http-client.error.js'

/**
 * DI token for an http-client implementation.
 */
export const HTTP_CLIENT = Symbol('HttpClient')

/**
 * Base result for a successful HTTP interaction.
 *
 * @internal
 */
export interface HttpClientBaseResult {
  readonly error: HttpClientError | null
  readonly status: number
  readonly responseHeaders: HttpHeaders
  readonly connection: HttpConnection
}

/**
 * Simple response result with the full body in memory.
 */
export interface HttpClientSimpleResult extends HttpClientBaseResult {
  readonly responseBody: HttpBody
}

/**
 * Streaming response result with a readable stream.
 */
export interface HttpClientStreamResult extends HttpClientBaseResult {
  readonly responseStream: Readable
}

/**
 * Defines the public contract for an http-client.
 *
 * Provides methods for making HTTP requests:
 * - Simple request/response
 * - Streaming request with simple response
 * - Simple request with streaming response
 *
 * All methods support proxy configuration and timeouts.
 */
export interface HttpClient {
  /**
   * Performs a simple HTTP request and returns a simple response.
   *
   * Both the request body and response body are fully loaded into memory.
   * Suitable for small to medium-sized payloads.
   *
   * @param proxy - The proxy URL.
   * @param method - The request method.
   * @param url - The target URL.
   * @param requestHeaders - The request headers to send.
   * @param requestBody - The request body as a Buffer.
   * @param connectTimeout - The connection timeout in milliseconds.
   * @param timeout - The total request timeout in milliseconds.
   * @param headersSizeLimit - The maximum headers size in bytes.
   * @param bodySizeLimit - The maximum body size in bytes.
   * @returns The result object containing the response or error details.
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
  ): Promise<HttpClientSimpleResult>

  /**
   * Performs a streaming HTTP request and returns a simple response.
   *
   * The request body is streamed from a readable stream, allowing large uploads.
   * The response body is fully loaded into memory.
   *
   * @param proxy - The proxy URL.
   * @param method - The request method.
   * @param url - The target URL.
   * @param requestHeaders - The request headers to send.
   * @param requestStream - The request body as a readable stream.
   * @param connectTimeout - The connection timeout in milliseconds.
   * @param timeout - The total request timeout in milliseconds.
   * @param headersSizeLimit - The maximum headers size in bytes.
   * @param bodySizeLimit - The maximum body size in bytes.
   * @returns The result object containing the response or error details.
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
  ): Promise<HttpClientSimpleResult>

  /**
   * Performs a simple HTTP request and returns a streaming response.
   *
   * The request body is fully loaded into memory, but the response is streamed,
   * allowing large downloads to be processed incrementally.
   *
   * @param proxy - The proxy URL.
   * @param method - The request method.
   * @param url - The target URL.
   * @param requestHeaders - The request headers to send.
   * @param requestBody - The request body as a Buffer.
   * @param connectTimeout - The connection timeout in milliseconds.
   * @param timeout - The total request timeout in milliseconds.
   * @param headersSizeLimit - The maximum headers size in bytes.
   * @returns The result object containing the response or error details.
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
  ): Promise<HttpClientStreamResult>
}

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

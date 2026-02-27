import { HttpBody, HttpConnection, HttpHeaders, HttpMethod } from '@famir/http-tools'
import type { Readable } from 'node:stream'
import { HttpClientError } from './http-client.error.js'

export const HTTP_CLIENT = Symbol('HttpClient')

export interface HttpClient {
  simpleForward(
    connectTimeout: number,
    timeout: number,
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    responseSizeLimit: number
  ): Promise<HttpClientSimpleResult | HttpClientErrorResult>
  streamRequestForward(
    connectTimeout: number,
    timeout: number,
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestStream: Readable,
    responseSizeLimit: number
  ): Promise<HttpClientSimpleResult | HttpClientErrorResult>
  streamResponseForward(
    connectTimeout: number,
    timeout: number,
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    responseSizeLimit: number
  ): Promise<HttpClientStreamResult | HttpClientErrorResult>
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

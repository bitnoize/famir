import { DIContainer } from '@famir/common'
import {
  HTTP_CLIENT,
  HttpClient,
  HttpClientErrorResult,
  HttpClientSimpleResult,
  HttpClientStreamResult,
} from '@famir/http-client'
import { HttpBody, HttpHeaders, HttpMethod } from '@famir/http-proto'
import type { Readable } from 'node:stream'

/**
 * DI token for the forward service.
 *
 * @category Forward
 */
export const FORWARD_SERVICE = Symbol('ForwardService')

/**
 * Represents the forward service.
 *
 * @category Forward
 */
export class ForwardService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ForwardService>(
      FORWARD_SERVICE,
      (c) => new ForwardService(c.resolve<HttpClient>(HTTP_CLIENT))
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param httpClient - The http-client instance.
   */
  constructor(protected readonly httpClient: HttpClient) {}

  async simple(data: {
    proxy: string
    method: HttpMethod
    url: string
    requestHeaders: HttpHeaders
    requestBody: HttpBody
    connectTimeout: number
    timeout: number
    headersSizeLimit: number
    bodySizeLimit: number
  }): Promise<HttpClientSimpleResult | HttpClientErrorResult> {
    return await this.httpClient.simple(
      data.proxy,
      data.method,
      data.url,
      data.requestHeaders,
      data.requestBody,
      data.connectTimeout,
      data.timeout,
      data.headersSizeLimit,
      data.bodySizeLimit
    )
  }

  async streamRequest(data: {
    proxy: string
    method: HttpMethod
    url: string
    requestHeaders: HttpHeaders
    requestStream: Readable
    connectTimeout: number
    timeout: number
    headersSizeLimit: number
    bodySizeLimit: number
  }): Promise<HttpClientSimpleResult | HttpClientErrorResult> {
    return await this.httpClient.streamRequest(
      data.proxy,
      data.method,
      data.url,
      data.requestHeaders,
      data.requestStream,
      data.connectTimeout,
      data.timeout,
      data.headersSizeLimit,
      data.bodySizeLimit
    )
  }

  async streamResponse(data: {
    proxy: string
    method: HttpMethod
    url: string
    requestHeaders: HttpHeaders
    requestBody: HttpBody
    connectTimeout: number
    timeout: number
    headersSizeLimit: number
  }): Promise<HttpClientStreamResult | HttpClientErrorResult> {
    return await this.httpClient.streamResponse(
      data.proxy,
      data.method,
      data.url,
      data.requestHeaders,
      data.requestBody,
      data.connectTimeout,
      data.timeout,
      data.headersSizeLimit
    )
  }
}

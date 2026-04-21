import { DIContainer } from '@famir/common'
import {
  HTTP_CLIENT,
  HttpClient,
  HttpClientErrorResult,
  HttpClientSimpleResult,
  HttpClientStreamResult,
} from '@famir/http-client'
import {
  FORWARD_SERVICE,
  ForwardSimpleData,
  ForwardStreamRequestData,
  ForwardStreamResponseData,
} from './forward.js'

/**
 *
 */
export class ForwardService {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<ForwardService>(
      FORWARD_SERVICE,
      (c) => new ForwardService(c.resolve<HttpClient>(HTTP_CLIENT))
    )
  }

  constructor(protected readonly httpClient: HttpClient) {}

  /**
   *
   */
  async simple(data: ForwardSimpleData): Promise<HttpClientSimpleResult | HttpClientErrorResult> {
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

  /**
   *
   */
  async streamRequest(
    data: ForwardStreamRequestData
  ): Promise<HttpClientSimpleResult | HttpClientErrorResult> {
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

  /**
   *
   */
  async streamResponse(
    data: ForwardStreamResponseData
  ): Promise<HttpClientStreamResult | HttpClientErrorResult> {
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

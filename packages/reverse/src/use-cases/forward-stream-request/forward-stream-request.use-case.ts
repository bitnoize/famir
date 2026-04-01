import { DIContainer } from '@famir/common'
import {
  HTTP_CLIENT,
  HttpClient,
  HttpClientErrorResult,
  HttpClientSimpleResult
} from '@famir/http-client'
import {
  FORWARD_STREAM_REQUEST_USE_CASE,
  ForwardStreamRequestData
} from './forward-stream-request.js'

/*
 * Forward stream request use-case
 */
export class ForwardStreamRequestUseCase {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<ForwardStreamRequestUseCase>(
      FORWARD_STREAM_REQUEST_USE_CASE,
      (c) => new ForwardStreamRequestUseCase(c.resolve<HttpClient>(HTTP_CLIENT))
    )
  }

  constructor(protected readonly httpClient: HttpClient) {}

  /*
   * Execute use-case
   */
  async execute(
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
}

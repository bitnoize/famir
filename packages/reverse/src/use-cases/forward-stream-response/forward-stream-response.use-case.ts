import { DIContainer } from '@famir/common'
import {
  HTTP_CLIENT,
  HttpClient,
  HttpClientErrorResult,
  HttpClientStreamResult,
} from '@famir/http-client'
import {
  FORWARD_STREAM_RESPONSE_USE_CASE,
  ForwardStreamResponseData,
} from './forward-stream-response.js'

/*
 * Forward stream response use-case
 */
export class ForwardStreamResponseUseCase {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<ForwardStreamResponseUseCase>(
      FORWARD_STREAM_RESPONSE_USE_CASE,
      (c) => new ForwardStreamResponseUseCase(c.resolve<HttpClient>(HTTP_CLIENT))
    )
  }

  constructor(protected readonly httpClient: HttpClient) {}

  /*
   * Execute use-case
   */
  async execute(
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

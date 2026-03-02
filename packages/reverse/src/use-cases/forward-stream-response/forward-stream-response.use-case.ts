import { DIContainer } from '@famir/common'
import {
  HTTP_CLIENT,
  HttpClient,
  HttpClientErrorResult,
  HttpClientStreamResult
} from '@famir/http-client'
import { ForwardStreamResponseData } from './forward-stream-response.js'

export const FORWARD_STREAM_RESPONSE_USE_CASE = Symbol('ForwardStreamResponseUseCase')

export class ForwardStreamResponseUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ForwardStreamResponseUseCase>(
      FORWARD_STREAM_RESPONSE_USE_CASE,
      (c) => new ForwardStreamResponseUseCase(c.resolve<HttpClient>(HTTP_CLIENT))
    )
  }

  constructor(protected readonly httpClient: HttpClient) {}

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

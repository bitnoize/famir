import { DIContainer } from '@famir/common'
import {
  HTTP_CLIENT,
  HttpClient,
  HttpClientErrorResult,
  HttpClientSimpleResult
} from '@famir/http-client'
import { ForwardStreamRequestData } from './forward-stream-request.js'

export const FORWARD_STREAM_REQUEST_USE_CASE = Symbol('ForwardStreamRequestUseCase')

export class ForwardStreamRequestUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ForwardStreamRequestUseCase>(
      FORWARD_STREAM_REQUEST_USE_CASE,
      (c) => new ForwardStreamRequestUseCase(c.resolve<HttpClient>(HTTP_CLIENT))
    )
  }

  constructor(protected readonly httpClient: HttpClient) {}

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

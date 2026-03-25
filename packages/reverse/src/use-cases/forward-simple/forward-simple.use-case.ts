import { DIContainer } from '@famir/common'
import {
  HTTP_CLIENT,
  HttpClient,
  HttpClientErrorResult,
  HttpClientSimpleResult
} from '@famir/http-client'
import { FORWARD_SIMPLE_USE_CASE, ForwardSimpleData } from './forward-simple.js'

export class ForwardSimpleUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ForwardSimpleUseCase>(
      FORWARD_SIMPLE_USE_CASE,
      (c) => new ForwardSimpleUseCase(c.resolve<HttpClient>(HTTP_CLIENT))
    )
  }

  constructor(protected readonly httpClient: HttpClient) {}

  async execute(data: ForwardSimpleData): Promise<HttpClientSimpleResult | HttpClientErrorResult> {
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
}

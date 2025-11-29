import { DIContainer } from '@famir/common'
import { HTTP_CLIENT, HttpClient, HttpClientRequest, HttpClientResponse } from '@famir/domain'

export const BUILD_RESPONSE_SERVICE = Symbol('BuildResponseService')

export class BuildResponseService {
  static inject(container: DIContainer) {
    container.registerSingleton<BuildResponseService>(
      BUILD_RESPONSE_SERVICE,
      (c) => new BuildResponseService(c.resolve<HttpClient>(HTTP_CLIENT))
    )
  }

  constructor(protected readonly httpClient: HttpClient) {}

  async forwardRequest(request: HttpClientRequest): Promise<HttpClientResponse> {
    return await this.httpClient.forwardRequest(request)
  }
}

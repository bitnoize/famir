import { DIContainer } from '@famir/common'
import {
  HTTP_CLIENT,
  HttpClient,
  HttpClientError,
  HttpClientErrorCode,
  HttpClientRequest,
  HttpClientResponse,
  HttpServerError
} from '@famir/domain'
import { BaseService } from '../base/index.js'

export const BUILD_RESPONSE_SERVICE = Symbol('BuildResponseService')

export class BuildResponseService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<BuildResponseService>(
      BUILD_RESPONSE_SERVICE,
      (c) => new BuildResponseService(c.resolve<HttpClient>(HTTP_CLIENT))
    )
  }

  constructor(protected readonly httpClient: HttpClient) {
    super()
  }

  async forwardRequest(request: HttpClientRequest): Promise<HttpClientResponse> {
    try {
      return await this.httpClient.forwardRequest(request)
    } catch (error) {
      if (error instanceof HttpClientError) {
        const knownErrors: HttpClientErrorCode[] = ['BAD_GATEWAY', 'GATEWAY_TIMEOUT']

        if (knownErrors.includes(error.code)) {
          throw new HttpServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }
}

import { DIContainer } from '@famir/common'
import { HTTP_CLIENT, HttpClient, HttpClientOrdinaryResponse } from '@famir/domain'
import { BaseService } from '../base/index.js'
import { OrdinaryRequestData } from './forwarding.js'

export const FORWARDING_SERVICE = Symbol('ForwardingService')

export class ForwardingService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<ForwardingService>(
      FORWARDING_SERVICE,
      (c) => new ForwardingService(c.resolve<HttpClient>(HTTP_CLIENT))
    )
  }

  constructor(protected readonly httpClient: HttpClient) {
    super()
  }

  async ordinaryRequest(data: OrdinaryRequestData): Promise<HttpClientOrdinaryResponse> {
    try {
      return await this.httpClient.ordinaryRequest(
        data.proxy,
        data.method,
        data.url,
        data.requestHeaders,
        data.requestBody,
        data.connectTimeout,
        data.ordinaryTimeout,
        data.responseBodyLimit
      )
    } catch (error) {
      this.filterHttpClientException(error, ['BAD_GATEWAY', 'GATEWAY_TIMEOUT'])

      throw error
    }
  }
}

import { DIContainer } from '@famir/common'
import {
  HTTP_CLIENT,
  HttpClient,
  HttpClientOrdinaryRequest,
  HttpClientOrdinaryResponse
} from '@famir/domain'
import { BaseService } from '../base/index.js'

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

  async ordinaryRequest(request: HttpClientOrdinaryRequest): Promise<HttpClientOrdinaryResponse> {
    return await this.httpClient.ordinaryRequest(request)
  }
}

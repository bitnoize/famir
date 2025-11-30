import { DIContainer } from '@famir/common'
import {
  PROXY_REPOSITORY,
  ProxyRepository,
  SESSION_REPOSITORY,
  SessionRepository
} from '@famir/domain'
import { BaseService } from '../base/index.js'
//import { Data, Reply } from './authorize.js'

export const AUTHORIZE_SERVICE = Symbol('AuthorizeService')

export class AuthorizeService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<AuthorizeService>(
      AUTHORIZE_SERVICE,
      (c) =>
        new AuthorizeService(
          c.resolve<ProxyRepository>(PROXY_REPOSITORY),
          c.resolve<SessionRepository>(SESSION_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly proxyRepository: ProxyRepository,
    protected readonly sessionRepository: SessionRepository
  ) {
    super()
  }

  //async execute(data: AuthorizeData): Promise<AuthorizeReply> {}
}

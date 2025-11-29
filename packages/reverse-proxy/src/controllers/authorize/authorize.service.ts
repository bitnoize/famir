import { DIContainer } from '@famir/common'
import {
  HttpServerError,
  SESSION_REPOSITORY,
  PROXY_REPOSITORY,
  ProxyRepository,
  SessionRepository,
} from '@famir/domain'
import { AuthorizeData, AuthorizeReply } from './authorize.js'

export const AUTHORIZE_SERVICE = Symbol('AuthorizeService')

export class AuthorizeService {
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
  ) {}

  async execute(data: AuthorizeData): Promise<AuthorizeReply> {
  }
}

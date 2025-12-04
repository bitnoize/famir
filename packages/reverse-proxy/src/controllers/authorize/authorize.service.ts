import { DIContainer } from '@famir/common'
import {
  HttpServerError,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
  ReadSessionData,
  SESSION_REPOSITORY,
  SessionModel,
  SessionRepository
} from '@famir/domain'
import { BaseService } from '../base/index.js'
import { CreateSessionData } from './authorize.js'

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

  async createSession(data: CreateSessionData): Promise<{
    proxy: ProxyModel
    session: SessionModel
  }> {
    try {
      const session = await this.sessionRepository.createSession({
        campaignId: data.campaignId
      })

      const proxy = await this.proxyRepository.readProxy({
        campaignId: session.campaignId,
        proxyId: session.proxyId
      })

      if (!proxy) {
        throw new HttpServerError(`Proxy lost on create session`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return {
        session,
        proxy
      }
    } catch (error) {
      this.filterDatabaseException(error, ['SERVICE_UNAVAILABLE'])
    }
  }

  async readSession(data: ReadSessionData): Promise<SessionModel | null> {
    return await this.sessionRepository.readSession(data)
  }
}

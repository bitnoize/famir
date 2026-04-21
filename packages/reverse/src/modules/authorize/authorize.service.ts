import { DIContainer } from '@famir/common'
import {
  DatabaseError,
  EnabledLureModel,
  EnabledProxyModel,
  FullRedirectorModel,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
  REDIRECTOR_REPOSITORY,
  RedirectorRepository,
  SESSION_REPOSITORY,
  SessionModel,
  SessionRepository,
} from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import {
  AUTHORIZE_SERVICE,
  AuthSessionData,
  CreateSessionData,
  FindLureData,
  ReadProxyData,
  ReadRedirectorData,
  UpgradeSessionData,
} from './authorize.js'

/**
 * @category Authorize
 */
export class AuthorizeService {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<AuthorizeService>(
      AUTHORIZE_SERVICE,
      (c) =>
        new AuthorizeService(
          c.resolve<ProxyRepository>(PROXY_REPOSITORY),
          c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY),
          c.resolve<LureRepository>(LURE_REPOSITORY),
          c.resolve<SessionRepository>(SESSION_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly proxyRepository: ProxyRepository,
    protected readonly redirectorRepository: RedirectorRepository,
    protected readonly lureRepository: LureRepository,
    protected readonly sessionRepository: SessionRepository
  ) {}

  /*
   * Read proxy
   */
  async readProxy(data: ReadProxyData): Promise<EnabledProxyModel> {
    const proxy = await this.proxyRepository.read(data.campaignId, data.proxyId)

    if (!(proxy && ProxyModel.isEnabled(proxy))) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `Read proxy failed`,
          data,
        },
        code: 'SERVICE_UNAVAILABLE',
      })
    }

    return proxy
  }

  /*
   * Read redirector
   */
  async readRedirector(data: ReadRedirectorData): Promise<FullRedirectorModel> {
    const redirector = await this.redirectorRepository.readFull(data.campaignId, data.redirectorId)

    if (!redirector) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `Read redirector failed`,
          data,
        },
        code: 'SERVICE_UNAVAILABLE',
      })
    }

    return redirector
  }

  /*
   * Find lure
   */
  async findLure(data: FindLureData): Promise<EnabledLureModel | null> {
    const lure = await this.lureRepository.find(data.campaignId, data.path)

    if (!(lure && LureModel.isEnabled(lure))) {
      return null
    }

    return lure
  }

  /*
   * Create session
   */
  async createSession(data: CreateSessionData): Promise<SessionModel> {
    try {
      return await this.sessionRepository.create(data.campaignId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw new HttpServerError(`Service unavailable`, {
            cause: error,
            context: {
              reason: `Create session failed`,
            },
            code: 'SERVICE_UNAVAILABLE',
          })
        }
      }

      throw error
    }
  }

  /**
   * Auth session
   */
  async authSession(data: AuthSessionData): Promise<SessionModel | null> {
    try {
      return await this.sessionRepository.auth(data.campaignId, data.sessionId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw new HttpServerError(`Service unavailable`, {
            cause: error,
            context: {
              reason: `Auth session failed`,
            },
            code: `SERVICE_UNAVAILABLE`,
          })
        } else if (error.code === 'FORBIDDEN') {
          return null
        }
      }

      throw error
    }
  }

  /*
   * Upgrade session
   */
  async upgradeSession(data: UpgradeSessionData): Promise<boolean> {
    try {
      await this.sessionRepository.upgrade(
        data.campaignId,
        data.lureId,
        data.sessionId,
        data.secret
      )

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw new HttpServerError(`Not found`, {
            cause: error,
            context: {
              reason: `Upgrade session failed`,
            },
            code: `NOT_FOUND`,
          })
        } else if (error.code === 'FORBIDDEN') {
          return false
        }
      }

      throw error
    }
  }
}

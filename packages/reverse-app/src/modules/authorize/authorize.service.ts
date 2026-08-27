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

/**
 * DI token for the authorize service.
 *
 * @category Authorize
 */
export const AUTHORIZE_SERVICE = Symbol('AuthorizeService')

/**
 * Represents the authorize service.
 *
 * @category Authorize
 */
export class AuthorizeService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
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

  /**
   * Creates a new service instance.
   *
   * @param proxyRepository - The proxy repository instance.
   * @param redirectorRepository - The redirector repository instance.
   * @param lureRepository - The lure repository instance.
   * @param sessionRepository - The session repository instance.
   */
  constructor(
    protected readonly proxyRepository: ProxyRepository,
    protected readonly redirectorRepository: RedirectorRepository,
    protected readonly lureRepository: LureRepository,
    protected readonly sessionRepository: SessionRepository
  ) {}

  async readProxy(data: { campaignId: string; proxyId: string }): Promise<EnabledProxyModel> {
    const proxy = await this.proxyRepository.read(data.campaignId, data.proxyId)

    if (!(proxy && ProxyModel.isEnabled(proxy))) {
      throw HttpServerError.serviceUnavailable(`Service unavailable`)
    }

    return proxy
  }

  async readRedirector(data: {
    campaignId: string
    redirectorId: string
  }): Promise<FullRedirectorModel> {
    const redirector = await this.redirectorRepository.readFull(data.campaignId, data.redirectorId)

    if (!redirector) {
      throw HttpServerError.serviceUnavailable(`Service unavailable`)
    }

    return redirector
  }

  async findLure(data: { campaignId: string; path: string }): Promise<EnabledLureModel | null> {
    const lure = await this.lureRepository.find(data.campaignId, data.path)

    if (!(lure && LureModel.isEnabled(lure))) {
      return null
    }

    return lure
  }

  async createSession(data: { campaignId: string }): Promise<SessionModel> {
    try {
      return await this.sessionRepository.create(data.campaignId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.isNotFound) {
          throw HttpServerError.serviceUnavailable(`Service unavailable`)
        }

        throw HttpServerError.internalError(`Create session failed`, null, error)
      }

      throw error
    }
  }

  async authSession(data: { campaignId: string; sessionId: string }): Promise<SessionModel | null> {
    try {
      return await this.sessionRepository.auth(data.campaignId, data.sessionId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.isNotFound) {
          throw HttpServerError.serviceUnavailable(`Service unavailable`)
        }

        if (error.isForbidden) {
          return null
        }

        throw HttpServerError.internalError(`Auth session failed`, null, error)
      }

      throw error
    }
  }

  async upgradeSession(data: {
    campaignId: string
    lureId: string
    sessionId: string
    secret: string
  }): Promise<boolean> {
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
        if (error.isNotFound) {
          throw HttpServerError.serviceUnavailable(`Service unavailable`)
        }

        if (error.isForbidden) {
          return false
        }

        throw HttpServerError.internalError(`Upgrade session failed`, null, error)
      }

      throw error
    }
  }
}

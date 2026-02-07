import { DIContainer } from '@famir/common'
import {
  DatabaseError,
  DatabaseErrorCode,
  EnabledLureModel,
  EnabledProxyModel,
  FullRedirectorModel,
  HttpServerError,
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
  SessionRepository
} from '@famir/domain'
import { BaseService } from '../base/index.js'
import {
  AuthSessionData,
  CreateSessionData,
  ReadLurePathData,
  ReadProxyData,
  ReadRedirectorData,
  UpgradeSessionData
} from './authorize.js'

export const AUTHORIZE_SERVICE = Symbol('AuthorizeService')

export class AuthorizeService extends BaseService {
  static inject(container: DIContainer) {
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
  ) {
    super()
  }

  async readProxy(data: ReadProxyData): Promise<EnabledProxyModel> {
    const model = await this.proxyRepository.read(data.campaignId, data.proxyId)

    if (!(model && ProxyModel.isEnabled(model))) {
      throw new HttpServerError(`Read proxy failed`, {
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    return model
  }

  async readRedirector(data: ReadRedirectorData): Promise<FullRedirectorModel> {
    const model = await this.redirectorRepository.read(data.campaignId, data.redirectorId)

    if (!model) {
      throw new HttpServerError(`Read redirector failed`, {
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    return model
  }

  async readLurePath(data: ReadLurePathData): Promise<EnabledLureModel | null> {
    const model = await this.lureRepository.readPath(data.campaignId, data.path)

    return model && LureModel.isEnabled(model) ? model : null
  }

  async createSession(data: CreateSessionData): Promise<void> {
    try {
      await this.sessionRepository.create(data.campaignId, data.sessionId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND']

        if (knownErrorCodes.includes(error.code)) {
          throw new HttpServerError(`Create session failed`, {
            cause: error,
            code: 'SERVICE_UNAVAILABLE'
          })
        }
      }

      throw error
    }
  }

  async authSession(data: AuthSessionData): Promise<SessionModel | null> {
    try {
      return await this.sessionRepository.auth(data.campaignId, data.sessionId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND']

        if (knownErrorCodes.includes(error.code)) {
          throw new HttpServerError(`Auth session failed`, {
            cause: error,
            code: `SERVICE_UNAVAILABLE`
          })
        }

        if (error.code === 'FORBIDDEN') {
          return null
        }
      }

      throw error
    }
  }

  async upgradeSession(data: UpgradeSessionData): Promise<void> {
    try {
      await this.sessionRepository.upgrade(
        data.campaignId,
        data.lureId,
        data.sessionId,
        data.secret
      )
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND']

        if (knownErrorCodes.includes(error.code)) {
          throw new HttpServerError(`Upgrade session failed`, {
            cause: error,
            code: `SERVICE_UNAVAILABLE`
          })
        }

        if (error.code === 'FORBIDDEN') {
          throw new HttpServerError(`Upgrade session failed`, {
            cause: error,
            code: 'FORBIDDEN'
          })
        }
      }

      throw error
    }
  }
}

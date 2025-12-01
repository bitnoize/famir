import { DIContainer } from '@famir/common'
import {
  ReadSessionData,
  ReplServerError,
  SESSION_REPOSITORY,
  SessionModel,
  SessionRepository
} from '@famir/domain'
import { BaseService } from '../base/index.js'

export const SESSION_SERVICE = Symbol('SessionService')

export class SessionService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<SessionService>(
      SESSION_SERVICE,
      (c) => new SessionService(c.resolve<SessionRepository>(SESSION_REPOSITORY))
    )
  }

  constructor(protected readonly sessionRepository: SessionRepository) {
    super()
  }

  async readSession(data: ReadSessionData): Promise<SessionModel> {
    const sessionModel = await this.sessionRepository.readSession(data)

    if (!sessionModel) {
      throw new ReplServerError(`Session not found`, {
        code: 'NOT_FOUND'
      })
    }

    return sessionModel
  }
}

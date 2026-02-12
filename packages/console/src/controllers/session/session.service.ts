import { DIContainer } from '@famir/common'
import { SESSION_REPOSITORY, SessionModel, SessionRepository } from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import { BaseService } from '../base/index.js'
import { ReadSessionData } from './session.js'

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

  async read(data: ReadSessionData): Promise<SessionModel> {
    const model = await this.sessionRepository.read(data.campaignId, data.sessionId)

    if (!model) {
      throw new ReplServerError(`Session not found`, {
        code: 'NOT_FOUND'
      })
    }

    return model
  }
}

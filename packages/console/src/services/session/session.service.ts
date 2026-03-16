import { DIContainer } from '@famir/common'
import { SESSION_REPOSITORY, SessionModel, SessionRepository } from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import { ReadSessionData } from './session.js'

export const SESSION_SERVICE = Symbol('SessionService')

export class SessionService {
  static inject(container: DIContainer) {
    container.registerSingleton<SessionService>(
      SESSION_SERVICE,
      (c) => new SessionService(c.resolve<SessionRepository>(SESSION_REPOSITORY))
    )
  }

  constructor(protected readonly sessionRepository: SessionRepository) {}

  async read(data: ReadSessionData): Promise<SessionModel> {
    const session = await this.sessionRepository.read(data.campaignId, data.sessionId)

    if (!session) {
      throw new ReplServerError(`Session not found`, {
        code: 'NOT_FOUND'
      })
    }

    return session
  }
}

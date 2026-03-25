import { DIContainer } from '@famir/common'
import { DatabaseError, SESSION_REPOSITORY, SessionModel, SessionRepository } from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import { CREATE_SESSION_USE_CASE, CreateSessionData } from './create-session.js'

export class CreateSessionUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<CreateSessionUseCase>(
      CREATE_SESSION_USE_CASE,
      (c) => new CreateSessionUseCase(c.resolve<SessionRepository>(SESSION_REPOSITORY))
    )
  }

  constructor(protected readonly sessionRepository: SessionRepository) {}

  async execute(data: CreateSessionData): Promise<SessionModel> {
    try {
      return await this.sessionRepository.create(data.campaignId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw new HttpServerError(`Service unavailable`, {
            cause: error,
            context: {
              reason: `Create session failed`
            },
            code: 'SERVICE_UNAVAILABLE'
          })
        }
      }

      throw error
    }
  }
}

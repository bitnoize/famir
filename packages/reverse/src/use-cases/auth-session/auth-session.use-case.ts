import { DIContainer } from '@famir/common'
import { DatabaseError, SESSION_REPOSITORY, SessionModel, SessionRepository } from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import { AUTH_SESSION_USE_CASE, AuthSessionData } from './auth-session.js'

/*
 * Auth session use-case
 */
export class AuthSessionUseCase {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<AuthSessionUseCase>(
      AUTH_SESSION_USE_CASE,
      (c) => new AuthSessionUseCase(c.resolve<SessionRepository>(SESSION_REPOSITORY))
    )
  }

  constructor(protected readonly sessionRepository: SessionRepository) {}

  /*
   * Execute use-case
   */
  async execute(data: AuthSessionData): Promise<SessionModel | null> {
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
}

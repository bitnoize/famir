import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DatabaseErrorCode,
  SESSION_REPOSITORY,
  SessionModel,
  SessionRepository
} from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import { AuthSessionData } from './auth-session.js'

export const AUTH_SESSION_USE_CASE = Symbol('AuthSessionUseCase')

export class AuthSessionUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<AuthSessionUseCase>(
      AUTH_SESSION_USE_CASE,
      (c) => new AuthSessionUseCase(c.resolve<SessionRepository>(SESSION_REPOSITORY))
    )
  }

  constructor(protected readonly sessionRepository: SessionRepository) {}

  async execute(data: AuthSessionData): Promise<SessionModel | null> {
    try {
      return await this.sessionRepository.auth(data.campaignId, data.sessionId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND']

        if (arrayIncludes(knownErrorCodes, error.code)) {
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
}

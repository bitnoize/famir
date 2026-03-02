import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DatabaseErrorCode,
  SESSION_REPOSITORY,
  SessionModel,
  SessionRepository
} from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import { CreateSessionData } from './create-session.js'

export const CREATE_SESSION_USE_CASE = Symbol('CreateSessionUseCase')

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
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new HttpServerError(`Create session failed`, {
            cause: error,
            code: 'SERVICE_UNAVAILABLE'
          })
        }
      }

      throw error
    }
  }
}

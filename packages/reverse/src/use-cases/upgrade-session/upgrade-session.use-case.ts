import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DatabaseErrorCode,
  SESSION_REPOSITORY,
  SessionRepository
} from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import { UpgradeSessionData } from './upgrade-session.js'

export const UPGRADE_SESSION_USE_CASE = Symbol('UpgradeSessionUseCase')

export class UpgradeSessionUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<UpgradeSessionUseCase>(
      UPGRADE_SESSION_USE_CASE,
      (c) => new UpgradeSessionUseCase(c.resolve<SessionRepository>(SESSION_REPOSITORY))
    )
  }

  constructor(protected readonly sessionRepository: SessionRepository) {}

  async execute(data: UpgradeSessionData): Promise<void> {
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

        if (arrayIncludes(knownErrorCodes, error.code)) {
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

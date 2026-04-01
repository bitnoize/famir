import { DIContainer } from '@famir/common'
import { DatabaseError, SESSION_REPOSITORY, SessionRepository } from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import { UPGRADE_SESSION_USE_CASE, UpgradeSessionData } from './upgrade-session.js'

/*
 * Upgrade session use-case
 */
export class UpgradeSessionUseCase {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<UpgradeSessionUseCase>(
      UPGRADE_SESSION_USE_CASE,
      (c) => new UpgradeSessionUseCase(c.resolve<SessionRepository>(SESSION_REPOSITORY))
    )
  }

  constructor(protected readonly sessionRepository: SessionRepository) {}

  /*
   * Execute use-case
   */
  async execute(data: UpgradeSessionData): Promise<boolean> {
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
        if (error.code === 'NOT_FOUND') {
          throw new HttpServerError(`Not found`, {
            cause: error,
            context: {
              reason: `Upgrade session failed`
            },
            code: `NOT_FOUND`
          })
        } else if (error.code === 'FORBIDDEN') {
          return false
        }
      }

      throw error
    }
  }
}

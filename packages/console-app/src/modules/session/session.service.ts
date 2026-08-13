import { DIContainer } from '@famir/common'
import { SESSION_REPOSITORY, SessionModel, SessionRepository } from '@famir/database'
import { ReplServerError } from '@famir/repl-server'

/**
 * DI token for the session service.
 *
 * @category Session
 */
export const SESSION_SERVICE = Symbol('SessionService')

/**
 * Represents the session service.
 *
 * @category Session
 */
export class SessionService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<SessionService>(
      SESSION_SERVICE,
      (c) => new SessionService(c.resolve<SessionRepository>(SESSION_REPOSITORY))
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param sessionRepository - The session repository instance.
   */
  constructor(protected readonly sessionRepository: SessionRepository) {}

  /**
   * Reads the session by its ID.
   */
  async read(data: { campaignId: string; sessionId: string }): Promise<SessionModel> {
    const session = await this.sessionRepository.read(data.campaignId, data.sessionId)

    if (!session) {
      throw ReplServerError.notFound(`Session not found`)
    }

    return session
  }
}

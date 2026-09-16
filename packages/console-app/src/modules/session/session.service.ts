import { DIContainer } from '@famir/common'
import {
  DatabaseError,
  ReplServerError,
  SESSION_REPOSITORY,
  SessionModel,
  SessionRepository,
} from '@famir/domain'

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

  /**
   * Revoking a session and stopping authorization.
   */
  async revoke(data: { campaignId: string; sessionId: string }): Promise<void> {
    try {
      await this.sessionRepository.revoke(data.campaignId, data.sessionId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.isNotFound) {
          throw ReplServerError.notFound(error.message)
        }

        throw ReplServerError.internalError(`Revoke session failed`, null, error)
      }

      throw error
    }
  }

  /**
   * Lists campaign session history.
   */
  async list(data: { campaignId: string; limit: number }): Promise<SessionModel[]> {
    const sessions = await this.sessionRepository.list(data.campaignId, data.limit)

    if (!sessions) {
      throw ReplServerError.notFound(`Campaign not found`)
    }

    return sessions
  }
}

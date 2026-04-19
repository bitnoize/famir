import { SessionModel } from './session.models.js'

/**
 * @category Session
 * @internal
 */
export const SESSION_REPOSITORY = Symbol('SessionRepository')

/**
 * Represents session repository
 *
 * @category Session
 */
export interface SessionRepository {
  /**
   * Create session
   */
  create(campaignId: string): Promise<SessionModel>

  /**
   * Read session by id
   */
  read(campaignId: string, sessionId: string): Promise<SessionModel | null>

  /**
   * Auth session
   */
  auth(campaignId: string, sessionId: string): Promise<SessionModel>

  /**
   * Upgrade session
   */
  upgrade(campaignId: string, lureId: string, sessionId: string, secret: string): Promise<void>
}

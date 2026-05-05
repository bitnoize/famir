import { SessionModel } from './session.models.js'

/**
 * DI token for session repository.
 *
 * @category Session
 * @internal
 */
export const SESSION_REPOSITORY = Symbol('SessionRepository')

/**
 * Represents a session repository.
 *
 * @category Session
 */
export interface SessionRepository {
  /**
   * Creates a new session in the specified campaign.
   *
   * The session is automatically assigned to a random enabled proxy.
   * A unique session ID and secret are generated automatically.
   *
   * @param campaignId - The ID of the campaign to create the session in
   * @returns The newly created session model
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If no enabled proxies are available
   */
  create(campaignId: string): Promise<SessionModel>

  /**
   * Reads a session by its ID.
   *
   * @param campaignId - The ID of the campaign containing the session
   * @param sessionId - The session ID to read
   * @returns The session model, or `null` if not found
   */
  read(campaignId: string, sessionId: string): Promise<SessionModel | null>

  /**
   * Authorizes a session.
   *
   * This method:
   * 1. Updates the session `authorized_at` timestamp.
   * 2. Extends the session TTL using `session_expire`.
   * 3. If the current proxy is disabled, re-assigns to a random enabled proxy.
   *
   * @param campaignId - The ID of the campaign containing the session
   * @param sessionId - The session ID to authorize
   * @returns The updated session model
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the session does not exist
   * @throws {@link DatabaseError} If no enabled proxies are available
   */
  auth(campaignId: string, sessionId: string): Promise<SessionModel>

  /**
   * Upgrades a session.
   *
   * This method:
   * 1. Marks the session as "upgraded".
   * 2. Increments the `session_count` of the associated lure.
   *
   * @param campaignId - The ID of the campaign containing the session
   * @param lureId - The Lure ID through which the session is updated
   * @param sessionId - The session ID to upgrade
   * @param secret - The session secret
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the lure does not exist
   * @throws {@link DatabaseError} If the session does not exist
   * @throws {@link DatabaseError} If the secret does not match
   */
  upgrade(campaignId: string, lureId: string, sessionId: string, secret: string): Promise<void>
}

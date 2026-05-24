import { SessionModel } from './session.models.js'

/**
 * DI token for a session repository implementation.
 *
 * @category Session
 */
export const SESSION_REPOSITORY = Symbol('SessionRepository')

/**
 * Defines the public contract for a session repository.
 *
 * A session tracks a user's interaction with the mirror, including
 * their assigned proxy, upgrade status, and message count.
 *
 * @category Session
 */
export interface SessionRepository {
  /**
   * Creates a new session.
   *
   * The session is automatically assigned to a random enabled proxy.
   *
   * @param campaignId - The ID of the campaign to create the session in.
   * @returns The newly created session model.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If no enabled proxies are available.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  create(campaignId: string): Promise<SessionModel>

  /**
   * Reads the session by its ID.
   *
   * @param campaignId - The ID of the campaign containing the session.
   * @param sessionId - The session ID to read.
   * @returns The session model, or `null` if the session is not found.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  read(campaignId: string, sessionId: string): Promise<SessionModel | null>

  /**
   * Authorizes the session by its ID.
   *
   * If the session proxy is disabled, re-assigns it to a random enabled proxy.
   *
   * @param campaignId - The ID of the campaign containing the session.
   * @param sessionId - The session ID to authorize.
   * @returns The authorized session model.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the session does not exist.
   * @throws {@link DatabaseError} If no enabled proxies are available.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  auth(campaignId: string, sessionId: string): Promise<SessionModel>

  /**
   * Upgrades the session by its ID and secret.
   *
   * @param campaignId - The ID of the campaign containing the session.
   * @param lureId - The Lure ID through which the session is upgraded.
   * @param sessionId - The session ID to upgrade.
   * @param secret - The session secret.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the lure does not exist.
   * @throws {@link DatabaseError} If the session does not exist.
   * @throws {@link DatabaseError} If the secret does not match.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  upgrade(campaignId: string, lureId: string, sessionId: string, secret: string): Promise<void>
}

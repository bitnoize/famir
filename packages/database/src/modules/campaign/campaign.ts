import { CampaignModel, FullCampaignModel } from './campaign.models.js'

/**
 * DI token for campaign repository.
 *
 * @category Campaign
 * @internal
 */
export const CAMPAIGN_REPOSITORY = Symbol('CampaignRepository')

/**
 * Represents a campaign repository.
 *
 * @category Campaign
 */
export interface CampaignRepository {
  /**
   * Creates a new campaign.
   *
   * @param campaignId - The unique identifier for the new campaign
   * @param mirrorDomain - The public-facing mirror domain
   * @param description - Human-readable description
   * @param cryptSecret - Secret used for encrypting session data
   * @param upgradeSessionPath - URL path that triggers session upgrade
   * @param sessionCookieName - Name of the cookie used to track sessions
   * @param sessionExpire - TTL for an authorized session
   * @param newSessionExpire - TTL for a newly created, not-yet-authorized session
   * @param messageExpire - TTL for message logs
   *
   * @throws {@link DatabaseError} If a campaign with the same ID already exists
   * @throws {@link DatabaseError} If `mirrorDomain` is already used by another campaign
   * @throws {@link DatabaseError} If `sessionCookieName` is already used by another campaign
   */
  create(
    campaignId: string,
    mirrorDomain: string,
    description: string,
    cryptSecret: string,
    upgradeSessionPath: string,
    sessionCookieName: string,
    sessionExpire: number,
    newSessionExpire: number,
    messageExpire: number
  ): Promise<void>

  /**
   * Reads a campaign model by its ID.
   *
   * @param campaignId - The campaign ID to read
   * @returns The campaign model, or `null` if not found
   */
  read(campaignId: string): Promise<CampaignModel | null>

  /**
   * Reads a full campaign model by its ID.
   *
   * @param campaignId - The campaign ID to read
   * @returns The full campaign model, or `null` if not found
   */
  readFull(campaignId: string): Promise<FullCampaignModel | null>

  /**
   * Acquires a distributed lock for a campaign.
   *
   * @param campaignId - The campaign ID to lock
   * @returns A unique lock secret that must be used for subsequent operations
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is already locked
   */
  lock(campaignId: string): Promise<string>

  /**
   * Releases a previously acquired lock on a campaign.
   *
   * The lock secret must match the one returned by `lock()`.
   *
   * @param campaignId - The campaign ID to unlock
   * @param lockSecret - The lock secret returned by the `lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the lock secret does not match
   */
  unlock(campaignId: string, lockSecret: string): Promise<void>

  /**
   * Updates specific fields of a campaign.
   *
   * @param campaignId - The campaign ID to update
   * @param description - New description
   * @param sessionExpire - New session expire TTL
   * @param newSessionExpire - New new-session expire TTL
   * @param messageExpire - New message expire TTL
   * @param lockSecret - The lock secret obtained from `lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   */
  update(
    campaignId: string,
    description: string | null | undefined,
    sessionExpire: number | null | undefined,
    newSessionExpire: number | null | undefined,
    messageExpire: number | null | undefined,
    lockSecret: string
  ): Promise<void>

  /**
   * Delete a campaign model by its ID.
   *
   * @param campaignId - The campaign ID to delete
   * @param lockSecret - The lock secret obtained from `lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the campaign still has associated entities
   */
  delete(campaignId: string, lockSecret: string): Promise<void>

  /**
   * Lists all campaigns models.
   *
   * The campaigns are ordered by creation time (oldest first).
   *
   * @returns An array of campaign models
   */
  list(): Promise<CampaignModel[]>

  /**
   * Lists all full campaigns.
   *
   * The campaigns are ordered by creation time (oldest first).
   *
   * @returns An array of full campaign models
   */
  listFull(): Promise<FullCampaignModel[]>
}

/**
 * The time for which the campaign is blocked.
 *
 * @category none
 * @internal
 */
export const CAMPAIGN_LOCK_TIMEOUT = 5 * 60 * 1000

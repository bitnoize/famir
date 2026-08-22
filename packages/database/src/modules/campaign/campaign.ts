import { CampaignModel, FullCampaignModel } from './campaign.models.js'

/**
 * DI token for a campaign repository implementation.
 *
 * @category Campaign
 */
export const CAMPAIGN_REPOSITORY = Symbol('CampaignRepository')

/**
 * Defines the public contract for a campaign repository.
 *
 * A campaign is the top-level container that groups all related
 * proxies, targets, redirectors, lures, sessions and messages.
 *
 * @category Campaign
 */
export interface CampaignRepository {
  /**
   * Creates a new campaign.
   *
   * @param campaignId - The new campaign ID to create.
   * @param mirrorDomain - The public-facing mirror domain for the campaign.
   * @param description - The human-readable description for the campaign.
   * @param cryptSecret - The secret used for encrypting session data.
   * @param upgradeSessionPath - The URL path that triggers session upgrade.
   * @param sessionCookieName - The name of the cookie used to track authorized sessions.
   * @param sessionExpire - The TTL for an authorized session in milliseconds.
   * @param newSessionExpire - The TTL for a not-yet-authorized session in milliseconds.
   * @param messageExpire - The TTL for a message in milliseconds.
   * @throws {@link DatabaseError} If a campaign with the same ID already exists.
   * @throws {@link DatabaseError} If the mirror domain is already used by another campaign.
   * @throws {@link DatabaseError} If the session cookie name is already used by another campaign.
   * @throws {@link DatabaseError} If the data validation fails.
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
   * Reads the campaign by its ID.
   *
   * @param campaignId - The campaign ID to read.
   * @returns The campaign model, or `null` if the campaign is not found.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  read(campaignId: string): Promise<CampaignModel | null>

  /**
   * Reads the full campaign by its ID.
   *
   * @param campaignId - The campaign ID to read.
   * @returns The full campaign model, or `null` if the campaign is not found.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  readFull(campaignId: string): Promise<FullCampaignModel | null>

  /**
   * Acquires a distributed lock for the campaign.
   *
   * This lock is required for any mutating operations.
   *
   * @param campaignId - The campaign ID to lock.
   * @returns The unique lock secret that must be used for subsequent operations.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the campaign is already locked.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  lock(campaignId: string): Promise<string>

  /**
   * Releases a previously acquired lock on the campaign.
   *
   * The lock secret must match the one returned by {@link lock}.
   *
   * @param campaignId - The campaign ID to unlock.
   * @param lockSecret - The lock secret returned by the {@link lock}.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the lock secret does not match.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  unlock(campaignId: string, lockSecret: string): Promise<void>

  /**
   * Updates the campaign specific fields.
   *
   * @param campaignId - The campaign ID to update.
   * @param description - The new human-readable description for the campaign.
   * @param sessionExpire - The new TTL for an authorized session in milliseconds.
   * @param newSessionExpire - The new TTL for a not-yet-authorized session in milliseconds.
   * @param messageExpire - The new TTL for a message in milliseconds.
   * @param lockSecret - The lock secret obtained from {@link lock}.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the campaign is not locked.
   * @throws {@link DatabaseError} If the lock secret does not match.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  update(
    campaignId: string,
    description: string,
    sessionExpire: number,
    newSessionExpire: number,
    messageExpire: number,
    lockSecret: string
  ): Promise<void>

  /**
   * Deletes the campaign by its ID.
   *
   * @param campaignId - The campaign ID to delete.
   * @param lockSecret - The lock secret obtained from {@link lock}.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the campaign is not locked.
   * @throws {@link DatabaseError} If the lock secret does not match.
   * @throws {@link DatabaseError} If the campaign still has associated entities.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  delete(campaignId: string, lockSecret: string): Promise<void>

  /**
   * Lists all campaigns.
   *
   * The campaigns are ordered by creation time (oldest first).
   *
   * @returns The array of campaign models.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  list(): Promise<CampaignModel[]>

  /**
   * Lists all full campaigns.
   *
   * The campaigns are ordered by creation time (oldest first).
   *
   * @returns The array of full campaign models.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  listFull(): Promise<FullCampaignModel[]>
}

/**
 * Time for which a campaign is blocked in milliseconds.
 *
 * @category none
 * @internal
 */
export const CAMPAIGN_LOCK_TIMEOUT = 5 * 60 * 1000

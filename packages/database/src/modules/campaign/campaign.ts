import { CampaignModel, FullCampaignModel } from './campaign.models.js'

/**
 * @category Campaign
 * @internal
 */
export const CAMPAIGN_REPOSITORY = Symbol('CampaignRepository')

/**
 * Represents a campaign repository
 *
 * @category Campaign
 */
export interface CampaignRepository {
  /**
   * Create campaign
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
   * Read campaign by id
   */
  read(campaignId: string): Promise<CampaignModel | null>

  /**
   * Read extended campaign by id
   */
  readFull(campaignId: string): Promise<FullCampaignModel | null>

  /**
   * Read campaign share
   */
  readShare(): Promise<CampaignShare>

  /**
   * Lock campaign
   */
  lock(campaignId: string): Promise<string>

  /**
   * Unlock campaign
   */
  unlock(campaignId: string, lockSecret: string): Promise<void>

  /**
   * Update campaign
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
   * Delete campaign
   */
  delete(campaignId: string, lockSecret: string): Promise<void>

  /**
   * List campaigns
   */
  list(): Promise<CampaignModel[]>

  /**
   * List extended campaigns
   */
  listFull(): Promise<CampaignModel[]>
}

/**
 * Represents a campaign share
 *
 * @category Campaign
 */
export interface CampaignShare {
  mirrorDomains: string[]
  sessionCookieNames: string[]
}

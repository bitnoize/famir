/**
 * @category DI
 */
export const CAMPAIGN_SERVICE = Symbol('CampaignService')

/**
 * @category Data
 */
export interface CreateCampaignData {
  campaignId: string
  mirrorDomain: string
  description: string
  cryptSecret?: string | null | undefined
  upgradeSessionPath: string
  sessionCookieName: string
  sessionExpire: number
  newSessionExpire: number
  messageExpire: number
}

/**
 * @category Data
 */
export interface ReadCampaignData {
  campaignId: string
}

/**
 * @category Data
 */
export interface LockCampaignData {
  campaignId: string
}

/**
 * @category Data
 */
export interface UnlockCampaignData {
  campaignId: string
  lockSecret: string
}

/**
 * @category Data
 */
export interface UpdateCampaignData {
  campaignId: string
  description: string | null | undefined
  sessionExpire: number | null | undefined
  newSessionExpire: number | null | undefined
  messageExpire: number | null | undefined
  lockSecret: string
}

/**
 * @category Data
 */
export interface DeleteCampaignData {
  campaignId: string
  lockSecret: string
}

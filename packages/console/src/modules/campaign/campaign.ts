/**
 * @category Campaign
 * @internal
 */
export const CAMPAIGN_CONTROLLER = Symbol('CampaignController')

/**
 * @category Campaign
 * @internal
 */
export const CAMPAIGN_SERVICE = Symbol('CampaignService')

/**
 * @category Campaign
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
 * @category Campaign
 */
export interface ReadCampaignData {
  campaignId: string
}

/**
 * @category Campaign
 */
export interface LockCampaignData {
  campaignId: string
}

/**
 * @category Campaign
 */
export interface UnlockCampaignData {
  campaignId: string
  lockSecret: string
}

/**
 * @category Campaign
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
 * @category Campaign
 */
export interface DeleteCampaignData {
  campaignId: string
  lockSecret: string
}

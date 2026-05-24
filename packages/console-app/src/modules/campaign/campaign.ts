/**
 * Arguments for creating a campaign.
 *
 * @category Campaign
 * @internal
 */
export interface CreateCampaignArgs {
  _: [string]
  mirrorDomain: string
  description: string
  cryptSecret?: string | null | undefined
  upgradeSessionPath: string
  sessionCookieName?: string | null | undefined
  sessionExpire: number
  newSessionExpire: number
  messageExpire: number
}

/**
 * Arguments for reading the campaign.
 *
 * @category Campaign
 * @internal
 */
export interface ReadCampaignArgs {
  _: [string]
}

/**
 * Arguments for locking the campaign.
 *
 * @category Campaign
 * @internal
 */
export interface LockCampaignArgs {
  _: [string]
}

/**
 * Arguments for unlocking the campaign.
 *
 * @category Campaign
 * @internal
 */
export interface UnlockCampaignArgs {
  _: [string]
  lockSecret: string
}

/**
 * Arguments for updating the campaign.
 *
 * @category Campaign
 * @internal
 */
export interface UpdateCampaignArgs {
  _: [string]
  description: string | null | undefined
  sessionExpire: number | null | undefined
  newSessionExpire: number | null | undefined
  messageExpire: number | null | undefined
  lockSecret: string
}

/**
 * Arguments for deleting the campaign.
 *
 * @category Campaign
 * @internal
 */
export interface DeleteCampaignArgs {
  _: [string]
  lockSecret: string
}

/**
 * Arguments for listing campaigns.
 *
 * @category Campaign
 * @internal
 */
export interface ListCampaignsArgs {
  _: string[]
}

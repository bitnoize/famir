export interface CampaignModel {
  readonly campaignId: string
  readonly mirrorDomain: string
  //checkIp: number // 0 - disabled, 1 - blacklist, 2 - whitelist
  readonly sessionCount: number
  readonly messageCount: number
  readonly isLocked: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
}

export const testCampaignModel = <T extends CampaignModel>(value: T | null): value is T => {
  return value != null
}

export interface FullCampaignModel extends CampaignModel {
  readonly description: string
  readonly landingUpgradePath: string
  readonly landingUpgradeParam: string
  readonly landingRedirectorParam: string
  readonly sessionCookieName: string
  readonly sessionExpire: number
  readonly newSessionExpire: number
  readonly messageExpire: number
  readonly proxyCount: number
  readonly targetCount: number
  readonly redirectorCount: number
  readonly lureCount: number
}

/**
 * Represents campaign
 *
 * @category Campaign
 */
export class CampaignModel {
  static isNotNull = <T extends CampaignModel>(model: T | null): model is T => {
    return model != null
  }

  constructor(
    readonly campaignId: string,
    readonly mirrorDomain: string,
    readonly isLocked: boolean,
    readonly sessionCount: number,
    readonly messageCount: number,
    readonly createdAt: Date
  ) {}
}

/**
 * Represents full campaign
 *
 * @category Campaign
 */
export class FullCampaignModel extends CampaignModel {
  constructor(
    campaignId: string,
    mirrorDomain: string,
    readonly description: string,
    readonly cryptSecret: string,
    readonly upgradeSessionPath: string,
    readonly sessionCookieName: string,
    readonly sessionCookieNames: string[],
    readonly sessionExpire: number,
    readonly newSessionExpire: number,
    readonly messageExpire: number,
    isLocked: boolean,
    readonly proxyCount: number,
    readonly targetCount: number,
    readonly redirectorCount: number,
    readonly lureCount: number,
    sessionCount: number,
    messageCount: number,
    createdAt: Date
  ) {
    super(campaignId, mirrorDomain, isLocked, sessionCount, messageCount, createdAt)
  }
}

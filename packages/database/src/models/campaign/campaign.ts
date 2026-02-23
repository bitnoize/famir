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
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export class FullCampaignModel extends CampaignModel {
  constructor(
    campaignId: string,
    mirrorDomain: string,
    readonly description: string,
    readonly lockTimeout: number,
    readonly landingUpgradePath: string,
    readonly sessionCookieName: string,
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
    createdAt: Date,
    updatedAt: Date
  ) {
    super(campaignId, mirrorDomain, isLocked, sessionCount, messageCount, createdAt, updatedAt)
  }
}

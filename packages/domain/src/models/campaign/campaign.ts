export class CampaignModel {
  static isNotNull = <T extends CampaignModel>(model: T | null): model is T => {
    return model != null
  }

  constructor(
    readonly campaignId: string,
    readonly mirrorDomain: string,
    readonly sessionCount: number,
    readonly messageCount: number,
    readonly isLocked: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export class FullCampaignModel extends CampaignModel {
  constructor(
    campaignId: string,
    mirrorDomain: string,
    readonly description: string,
    readonly landingUpgradePath: string,
    readonly landingUpgradeParam: string,
    readonly landingRedirectorParam: string,
    readonly sessionCookieName: string,
    readonly sessionExpire: number,
    readonly newSessionExpire: number,
    readonly messageExpire: number,
    readonly proxyCount: number,
    readonly targetCount: number,
    readonly redirectorCount: number,
    readonly lureCount: number,
    sessionCount: number,
    messageCount: number,
    isLocked: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(campaignId, mirrorDomain, sessionCount, messageCount, isLocked, createdAt, updatedAt)
  }
}

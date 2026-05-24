/**
 * Represents the campaign model.
 *
 * @category Campaign
 */
export class CampaignModel {
  /**
   * Type guard to filter out null models from a list.
   *
   * @param model - The model to check.
   * @returns `true` if the model is not null, `false` otherwise.
   */
  static isNotNull = <T extends CampaignModel>(model: T | null): model is T => {
    return model != null
  }

  /**
   * Creates a new campaign model instance.
   *
   * @param campaignId - The unique identifier for the campaign.
   * @param mirrorDomain - The public-facing mirror domain for the campaign.
   * @param isLocked - The flag indicating if the campaign is blocked.
   * @param sessionCount - The total number of sessions processed through this campaign.
   * @param messageCount - The total number of messages processed through this campaign.
   * @param createdAt - The date and time when the campaign was created.
   */
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
 * Represents the full campaign model.
 *
 * @category Campaign
 */
export class FullCampaignModel extends CampaignModel {
  /**
   * Creates a new full campaign model instance.
   *
   * @param campaignId - The unique identifier for the campaign.
   * @param mirrorDomain - The public-facing mirror domain for the campaign.
   * @param description - The human-readable description for the campaign.
   * @param cryptSecret - The secret used for encrypting session data.
   * @param upgradeSessionPath - The URL path that triggers a session upgrade.
   * @param sessionCookieName - The name of the cookie used to track authorized sessions.
   * @param sessionCookieNames - The names of the cookies used by all campaigns.
   * @param sessionExpire - The TTL for an authorized session in milliseconds.
   * @param newSessionExpire - The TTL for a not-yet-authorized session in milliseconds.
   * @param messageExpire - The TTL for a message in milliseconds.
   * @param isLocked - The flag indicating if the campaign is blocked.
   * @param proxyCount - The total number of proxies related to this campaign.
   * @param targetCount - The total number of targets related to this campaign.
   * @param redirectorCount - The total number of redirectors related to this campaign.
   * @param lureCount - The total number of lures related to this campaign.
   * @param sessionCount - The total number of sessions processed through this campaign.
   * @param messageCount - The total number of messages processed through this campaign.
   * @param createdAt - The date and time when the campaign was created.
   */
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

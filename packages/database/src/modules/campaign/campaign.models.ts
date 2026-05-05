/**
 * Represents a campaign model.
 *
 * @category Campaign
 */
export class CampaignModel {
  /**
   * Type guard to filter out null values in arrays.
   *
   * @param model - The model to check
   * @returns `true` if the model is not null, `false` otherwise
   */
  static isNotNull = <T extends CampaignModel>(model: T | null): model is T => {
    return model != null
  }

  /**
   * Creates a new campaign model instance.
   *
   * @param campaignId - The unique identifier of the campaign
   * @param mirrorDomain - The public-facing mirror domain
   * @param isLocked - Determines whether a campaign is blocked
   * @param sessionCount - Total number of sessions processed through this campaign
   * @param messageCount - Total number of messages processed through this campaign
   * @param createdAt - The date and time when the campaign was created
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
 * Represents a full campaign model.
 *
 * @category Campaign
 */
export class FullCampaignModel extends CampaignModel {
  /**
   * Creates a new full campaign model instance.
   *
   * @param campaignId - The unique identifier of the campaign
   * @param mirrorDomain - The public-facing mirror domain
   * @param description - Human-readable description
   * @param cryptSecret - Secret used for encrypting session data
   * @param upgradeSessionPath - URL path that triggers session upgrade
   * @param sessionCookieName - Name of the cookie used to track sessions
   * @param sessionExpire - TTL for an authorized session
   * @param newSessionExpire - TTL for a newly created, not-yet-authorized session
   * @param messageExpire - TTL for message logs
   * @param isLocked - Determines whether a campaign is blocked
   * @param proxyCount - Total number of proxies related to this campaign
   * @param targetCount - Total number of targets related to this campaign
   * @param redirectorCount - Total number of redirectors related to this campaign
   * @param lureCount - Total number of lures related to this campaign
   * @param sessionCount - Total number of sessions processed through this campaign
   * @param messageCount - Total number of messages processed through this campaign
   * @param createdAt - The date and time when the campaign was created
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

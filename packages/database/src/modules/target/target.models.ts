/**
 * Available values for the target access levels.
 *
 * @category Target
 * @internal
 */
export const TARGET_ACCESS_LEVELS = ['transparent', 'landing'] as const

/**
 * Type of access level to the target.
 *
 * @category Target
 */
export type TargetAccessLevel = (typeof TARGET_ACCESS_LEVELS)[number]

/**
 * Special value for the apex (root) subdomain.
 *
 * @category Target
 * @internal
 */
export const TARGET_SUB_APEX = '@'

/**
 * Represents the target model.
 *
 * @category Target
 */
export class TargetModel {
  /**
   * Type guard to filter out null models from a list.
   *
   * @param model - The model to check.
   * @returns `true` if the model is not null, `false` otherwise.
   */
  static isNotNull = <T extends TargetModel>(model: T | null): model is T => {
    return model != null
  }

  /**
   * Type guard to check if a model is enabled.
   *
   * @param model - The model to check.
   * @returns `true` if the model is enabled, `false` otherwise.
   */
  static isEnabled = <T extends TargetModel>(model: T): model is T & { isEnabled: true } => {
    return model.isEnabled
  }

  /**
   * Creates a new target model instance.
   *
   * @param campaignId - The ID of the campaign this target belongs to.
   * @param targetId - The unique identifier for the target.
   * @param accessLevel - The type of access level.
   * @param donorSecure - The flag indicating if the donor server uses HTTPS.
   * @param donorSub - The donor subdomain.
   * @param donorDomain - The donor domain name.
   * @param donorPort - The donor server port.
   * @param mirrorSecure - The flag indicating if the mirror server uses HTTPS.
   * @param mirrorSub - The mirror subdomain.
   * @param mirrorDomain - The mirror domain.
   * @param mirrorPort - The mirror server port.
   * @param isEnabled - The flag indicating if the target is currently active for traffic routing.
   * @param messageCount - The total number of messages processed for this target.
   * @param createdAt - The date and time when the target was created.
   */
  constructor(
    readonly campaignId: string,
    readonly targetId: string,
    readonly accessLevel: TargetAccessLevel,
    readonly donorSecure: boolean,
    readonly donorSub: string,
    readonly donorDomain: string,
    readonly donorPort: number,
    readonly mirrorSecure: boolean,
    readonly mirrorSub: string,
    readonly mirrorDomain: string,
    readonly mirrorPort: number,
    readonly isEnabled: boolean,
    readonly messageCount: number,
    readonly createdAt: Date
  ) {}

  /**
   * The donor protocol.
   *
   * @returns The 'https:' if donor is secure, 'http:' otherwise.
   */
  get donorProtocol(): string {
    return this.donorSecure ? 'https:' : 'http:'
  }

  /**
   * The donor hostname.
   *
   * @returns The concatenation of donor sub-domain and domain.
   */
  get donorHostname(): string {
    return this.donorSub !== TARGET_SUB_APEX
      ? [this.donorSub, this.donorDomain].join('.')
      : this.donorDomain
  }

  /**
   * The donor host.
   *
   * @returns The concatenation of donor sub-domain, domain and port.
   */
  get donorHost(): string {
    if (
      (!this.donorSecure && this.donorPort === 80) ||
      (this.donorSecure && this.donorPort === 443)
    ) {
      return this.donorHostname
    } else {
      return [this.donorHostname, this.donorPort.toString()].join(':')
    }
  }

  /**
   * The full donor URL.
   *
   * @returns The concatenation of donor protocol and host.
   */
  get donorUrl(): string {
    return [this.donorProtocol, '//', this.donorHost].join('')
  }

  /**
   * The mirror protocol.
   *
   * @returns The 'https:' if mirror is secure, 'http:' otherwise.
   */
  get mirrorProtocol(): string {
    return this.mirrorSecure ? 'https:' : 'http:'
  }

  /**
   * The mirror hostname.
   *
   * @returns The concatenation of mirror sub-domain and domain.
   */
  get mirrorHostname(): string {
    return this.mirrorSub !== TARGET_SUB_APEX
      ? [this.mirrorSub, this.mirrorDomain].join('.')
      : this.mirrorDomain
  }

  /**
   * The mirror host.
   *
   * @returns The concatenation of mirror sub-domain, domain and port.
   */
  get mirrorHost(): string {
    if (
      (!this.mirrorSecure && this.mirrorPort === 80) ||
      (this.mirrorSecure && this.mirrorPort === 443)
    ) {
      return this.mirrorHostname
    } else {
      return [this.mirrorHostname, this.mirrorPort.toString()].join(':')
    }
  }

  /**
   * The full mirror URL.
   *
   * @returns The concatenation of mirror protocol and host.
   */
  get mirrorUrl(): string {
    return [this.mirrorProtocol, '//', this.mirrorHost].join('')
  }
}

/**
 * Represents the enabled target model.
 *
 * @category Target
 */
export interface EnabledTargetModel extends TargetModel {
  /** Guaranteed to be `true` for enabled targets. */
  isEnabled: true
}

/**
 * Represents the full target model.
 *
 * @category Target
 */
export class FullTargetModel extends TargetModel {
  /**
   * Creates a new full target model instance.
   *
   * @param campaignId - The ID of the campaign this target belongs to.
   * @param targetId - The unique identifier for the target.
   * @param accessLevel - The type of access level.
   * @param donorSecure - The flag indicating if the donor server uses HTTPS.
   * @param donorSub - The donor subdomain.
   * @param donorDomain - The donor domain name.
   * @param donorPort - The donor server port.
   * @param mirrorSecure - The flag indicating if the mirror server uses HTTPS.
   * @param mirrorSub - The mirror subdomain.
   * @param mirrorDomain - The mirror domain.
   * @param mirrorPort - The mirror server port.
   * @param labels - The list of labels for categorization.
   * @param connectTimeout - The connection timeout in milliseconds.
   * @param simpleTimeout - The simple request timeout in milliseconds.
   * @param streamTimeout - The streaming request timeout in milliseconds.
   * @param headersSizeLimit - The maximum headers size in bytes.
   * @param bodySizeLimit - The maximum body size in bytes.
   * @param mainPage - The custom main page content.
   * @param notFoundPage - The custom not-found page content.
   * @param faviconIco - The custom favicon.ico content.
   * @param robotsTxt - The custom robots.txt content.
   * @param sitemapXml - The custom sitemap.xml content.
   * @param allowWebSockets - The flag indicating if WebSocket connections allowed.
   * @param isEnabled - The flag indicating if the target is currently active for traffic routing.
   * @param messageCount - The total number of messages processed for this target.
   * @param createdAt - The date and time when the target was created.
   */
  constructor(
    campaignId: string,
    targetId: string,
    accessLevel: TargetAccessLevel,
    donorSecure: boolean,
    donorSub: string,
    donorDomain: string,
    donorPort: number,
    mirrorSecure: boolean,
    mirrorSub: string,
    mirrorDomain: string,
    mirrorPort: number,
    readonly labels: string[],
    readonly connectTimeout: number,
    readonly simpleTimeout: number,
    readonly streamTimeout: number,
    readonly headersSizeLimit: number,
    readonly bodySizeLimit: number,
    readonly mainPage: string,
    readonly notFoundPage: string,
    readonly faviconIco: string,
    readonly robotsTxt: string,
    readonly sitemapXml: string,
    readonly allowWebSockets: boolean,
    isEnabled: boolean,
    messageCount: number,
    createdAt: Date
  ) {
    super(
      campaignId,
      targetId,
      accessLevel,
      donorSecure,
      donorSub,
      donorDomain,
      donorPort,
      mirrorSecure,
      mirrorSub,
      mirrorDomain,
      mirrorPort,
      isEnabled,
      messageCount,
      createdAt
    )
  }

  /**
   * Checks if the target has a specific label.
   *
   * @param value - The label to check.
   * @returns `true` if the label exists, `false` otherwise.
   */
  hasLabel(value: string): boolean {
    return this.labels.includes(value)
  }
}

/**
 * Represents the enabled full target model.
 *
 * @category Target
 */
export interface EnabledFullTargetModel extends FullTargetModel {
  /** Guaranteed to be `true` for enabled targets. */
  isEnabled: true
}

/**
 * Tuple containing a campaign ID and a target ID.
 *
 * @category Target
 */
export type TargetLink = [string, string]

/**
 * Dictionary mapping mirror hostnames to target links.
 *
 * @category Target
 */
export type TargetHosts = Record<string, TargetLink>

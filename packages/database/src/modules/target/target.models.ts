/**
 * Available values for target access levels.
 *
 * @category Target
 * @internal
 */
export const TARGET_ACCESS_LEVELS = ['transparent', 'landing'] as const

/**
 * Target access level.
 *
 * @category Target
 */
export type TargetAccessLevel = (typeof TARGET_ACCESS_LEVELS)[number]

/**
 * Special value representing the empty subdomain.
 *
 * @category Target
 * @internal
 */
export const TARGET_SUB_APEX = '@'

/**
 * Represents a target model.
 *
 * @category Target
 */
export class TargetModel {
  /**
   * Type guard to filter out null values in arrays.
   *
   * @param model - The model to check
   * @returns `true` if the model is not null, `false` otherwise
   */
  static isNotNull = <T extends TargetModel>(model: T | null): model is T => {
    return model != null
  }

  /**
   * Type guard to check if a target is enabled.
   *
   * @param model - The target model to check
   * @returns `true` if the target is enabled, `false` otherwise
   */
  static isEnabled = <T extends TargetModel>(model: T): model is T & { isEnabled: true } => {
    return model.isEnabled
  }

  /**
   * Creates a new target model instance.
   *
   * @param campaignId - The ID of the campaign this target belongs to
   * @param targetId - The unique identifier of the target
   * @param accessLevel - The access level
   * @param donorSecure - Whether the donor server uses HTTPS
   * @param donorSub - The donor subdomain
   * @param donorDomain - The donor domain name
   * @param donorPort - The donor server port
   * @param mirrorSecure - Whether the mirror uses HTTPS
   * @param mirrorSub - The mirror subdomain
   * @param mirrorDomain - The mirror domain
   * @param mirrorPort - The mirror server port
   * @param isEnabled - Whether the target is currently enabled
   * @param messageCount - Total number of messages processed for this target
   * @param createdAt - The date and time when the target was created
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
   * Returns the donor protocol.
   */
  get donorProtocol(): string {
    return this.donorSecure ? 'https:' : 'http:'
  }

  /**
   * Returns the full donor hostname.
   */
  get donorHostname(): string {
    return this.donorSub !== TARGET_SUB_APEX
      ? [this.donorSub, this.donorDomain].join('.')
      : this.donorDomain
  }

  /**
   * Returns the donor host.
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
   * Returns the full donor URL.
   */
  get donorUrl(): string {
    return [this.donorProtocol, '//', this.donorHost].join('')
  }

  /**
   * Returns the mirror protocol.
   */
  get mirrorProtocol(): string {
    return this.mirrorSecure ? 'https:' : 'http:'
  }

  /**
   * Returns the full mirror hostname.
   */
  get mirrorHostname(): string {
    return this.mirrorSub !== TARGET_SUB_APEX
      ? [this.mirrorSub, this.mirrorDomain].join('.')
      : this.mirrorDomain
  }

  /**
   * Returns the mirror host.
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
   * Returns the full mirror URL.
   */
  get mirrorUrl(): string {
    return [this.mirrorProtocol, '//', this.mirrorHost].join('')
  }
}

/**
 * Represents a full target model.
 *
 * @category Target
 */
export class FullTargetModel extends TargetModel {
  /**
   * Creates a new full target model instance.
   *
   * @param campaignId - The ID of the campaign this target belongs to
   * @param targetId - The unique identifier of the target
   * @param accessLevel - The access level
   * @param donorSecure - Whether the donor server uses HTTPS
   * @param donorSub - The donor subdomain
   * @param donorDomain - The donor domain name
   * @param donorPort - The donor server port
   * @param mirrorSecure - Whether the mirror uses HTTPS
   * @param mirrorSub - The mirror subdomain
   * @param mirrorDomain - The mirror domain
   * @param mirrorPort - The mirror server port
   * @param labels - Array of labels for categorization
   * @param connectTimeout - Connection timeout
   * @param simpleTimeout - Simple request timeout
   * @param streamTimeout - Streaming request timeout
   * @param headersSizeLimit - Maximum headers size in bytes
   * @param bodySizeLimit - Maximum body size in bytes
   * @param mainPage - Custom main page content
   * @param notFoundPage - Custom 404 page content
   * @param faviconIco - Custom favicon content
   * @param robotsTxt - Custom robots.txt content
   * @param sitemapXml - Custom sitemap.xml content
   * @param allowWebSockets - Whether to allow WebSocket connections
   * @param isEnabled - Whether the target is currently enabled
   * @param messageCount - Total number of messages processed for this target
   * @param createdAt - The date and time when the target was created
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
   * @param value - The label to check
   * @returns `true` if the label exists, `false` otherwise
   */
  hasLabel(value: string): boolean {
    return this.labels.includes(value)
  }
}

/**
 * Represents an enabled target model.
 *
 * @category Target
 */
export interface EnabledTargetModel extends TargetModel {
  /** Guaranteed to be `true` for enabled targets */
  isEnabled: true
}

/**
 * Represents an enabled full target model.
 *
 * @category Target
 */
export interface EnabledFullTargetModel extends FullTargetModel {
  /** Guaranteed to be `true` for enabled targets */
  isEnabled: true
}

/**
 * Target link (campaignId and targetId).
 *
 * @category Target
 */
export type TargetLink = [string, string]

/**
 * Target hosts dictionary.
 *
 * @category Target
 */
export type TargetHosts = Record<string, TargetLink>

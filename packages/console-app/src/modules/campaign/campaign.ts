import { TargetAccessLevel } from '@famir/database'

/**
 * Arguments for creating a campaign.
 *
 * @category Campaign
 * @internal
 */
export interface CreateCampaignArgs {
  _: [string]
  assetName: string
  mirrorDomain?: string | null | undefined
  cryptSecret?: string | null | undefined
  upgradeSessionPath?: string | null | undefined
  sessionCookieName?: string | null | undefined
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
 * Arguments for updating the campaign.
 *
 * @category Campaign
 * @internal
 */
export interface UpdateCampaignArgs {
  _: [string]
  assetName: string
}

/**
 * Arguments for deleting the campaign.
 *
 * @category Campaign
 * @internal
 */
export interface DeleteCampaignArgs {
  _: [string]
  force?: boolean | null | undefined
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

/**
 * Represents a campaign template campaign.
 *
 * @category Campaign
 * @internal
 */
export interface CampaignTemplateCampaign {
  campaignId: string
  mirrorDomain: string
  description: string
  cryptSecret: string
  upgradeSessionPath: string
  sessionCookieName: string
  sessionExpire: number
  newSessionExpire: number
  messageExpire: number
}

/**
 * Represents a raw campaign template campaign.
 *
 * @category Campaign
 * @internal
 */
export interface RawCampaignTemplateCampaign {
  mirrorDomain: string
  description?: string | null | undefined
  cryptSecret?: string | null | undefined
  upgradeSessionPath?: string | null | undefined
  sessionCookieName?: string | null | undefined
  sessionExpire?: number | null | undefined
  newSessionExpire?: number | null | undefined
  messageExpire?: number | null | undefined
}

/**
 * Represents a campaign template proxy.
 *
 * @category Campaign
 * @internal
 */
export interface CampaignTemplateProxy {
  proxyId: string
  url: string
  isEnabled: boolean
}

/**
 * Represents a raw campaign template proxy.
 *
 * @category Campaign
 * @internal
 */
export interface RawCampaignTemplateProxy {
  proxyId: string
  url: string
  isEnabled?: boolean | null | undefined
}

/**
 * Represents a campaign template target.
 *
 * @category Campaign
 * @internal
 */
export interface CampaignTemplateTarget {
  targetId: string
  accessLevel: TargetAccessLevel
  donorSecure: boolean
  donorSub: string
  donorDomain: string
  donorPort: number
  mirrorSecure: boolean
  mirrorSub: string
  mirrorPort: number
  labels: string[]
  connectTimeout: number
  simpleTimeout: number
  streamTimeout: number
  headersSizeLimit: number
  bodySizeLimit: number
  mainPage: string
  notFoundPage: string
  faviconIco: string
  robotsTxt: string
  sitemapXml: string
  allowWebSockets: boolean
  isEnabled: boolean
}

/**
 * Represents a raw campaign template target.
 *
 * @category Campaign
 * @internal
 */
export interface RawCampaignTemplateTarget {
  targetId: string
  accessLevel: TargetAccessLevel
  donorSecure: boolean
  donorSub: string
  donorDomain: string
  donorPort: number
  mirrorSecure: boolean
  mirrorSub: string
  mirrorPort: number
  labels?: string[] | null | undefined
  connectTimeout?: number | null | undefined
  simpleTimeout?: number | null | undefined
  streamTimeout?: number | null | undefined
  headersSizeLimit?: number | null | undefined
  bodySizeLimit?: number | null | undefined
  mainPage?: string | null | undefined
  notFoundPage?: string | null | undefined
  faviconIco?: string | null | undefined
  robotsTxt?: string | null | undefined
  sitemapXml?: string | null | undefined
  allowWebSockets?: boolean | null | undefined
  isEnabled?: boolean | null | undefined
}

/**
 * Represents a campaign template redirector.
 *
 * @category Campaign
 * @internal
 */
export interface CampaignTemplateRedirector {
  redirectorId: string
  page: string
  fields: string[]
}

/**
 * Represents a raw campaign template redirector.
 *
 * @category Campaign
 * @internal
 */
export interface RawCampaignTemplateRedirector {
  redirectorId: string
  page?: string | null | undefined
  fields?: string[] | null | undefined
}

/**
 * Represents a campaign template lure.
 *
 * @category Campaign
 * @internal
 */
export interface CampaignTemplateLure {
  lureId: string
  path: string
  redirectorId: string
  isEnabled: boolean
}

/**
 * Represents a raw campaign template lure.
 *
 * @category Campaign
 * @internal
 */
export interface RawCampaignTemplateLure {
  lureId: string
  path: string
  redirectorId: string
  isEnabled?: boolean | null | undefined
}

/**
 * Represents a campaign template.
 *
 * @category Campaign
 * @internal
 */
export interface CampaignTemplate {
  campaign: CampaignTemplateCampaign
  proxies: CampaignTemplateProxy[]
  targets: CampaignTemplateTarget[]
  redirectors: CampaignTemplateRedirector[]
  lures: CampaignTemplateLure[]
}

/**
 * Represents a raw campaign template.
 *
 * @category Campaign
 * @internal
 */
export interface RawCampaignTemplate {
  campaign: RawCampaignTemplateCampaign
  proxies?: RawCampaignTemplateProxy[] | null | undefined
  targets?: RawCampaignTemplateTarget[] | null | undefined
  redirectors?: RawCampaignTemplateRedirector[] | null | undefined
  lures?: RawCampaignTemplateLure[] | null | undefined
}

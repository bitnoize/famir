import { TargetAccessLevel } from '@famir/database'

/**
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
 * @category Campaign
 * @internal
 */
export interface ReadCampaignArgs {
  _: [string]
}

/**
 * @category Campaign
 * @internal
 */
export interface UpdateCampaignArgs {
  _: [string]
  assetName: string
}

/**
 * @category Campaign
 * @internal
 */
export interface DeleteCampaignArgs {
  _: [string]
  force: boolean
}

/**
 * @category Campaign
 * @internal
 */
export interface ListCampaignsArgs {
  _: string[]
}

/**
 * @category Campaign
 * @internal
 */
export interface CampaignPresetCampaign {
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
 * @category Campaign
 * @internal
 */
export interface RawCampaignPresetCampaign {
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
 * @category Campaign
 * @internal
 */
export interface CampaignPresetProxy {
  proxyId: string
  url: string
  isEnabled: boolean
}

/**
 * @category Campaign
 * @internal
 */
export interface RawCampaignPresetProxy {
  proxyId: string
  url: string
  isEnabled?: boolean | null | undefined
}

/**
 * @category Campaign
 * @internal
 */
export interface CampaignPresetTarget {
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
 * @category Campaign
 * @internal
 */
export interface RawCampaignPresetTarget {
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
 * @category Campaign
 * @internal
 */
export interface CampaignPresetRedirector {
  redirectorId: string
  page: string
  fields: string[]
}

/**
 * @category Campaign
 * @internal
 */
export interface RawCampaignPresetRedirector {
  redirectorId: string
  page?: string | null | undefined
  fields?: string[] | null | undefined
}

/**
 * @category Campaign
 * @internal
 */
export interface CampaignPresetLure {
  lureId: string
  path: string
  redirectorId: string
  isEnabled: boolean
}

/**
 * @category Campaign
 * @internal
 */
export interface RawCampaignPresetLure {
  lureId: string
  path: string
  redirectorId: string
  isEnabled?: boolean | null | undefined
}

/**
 * @category Campaign
 * @internal
 */
export interface CampaignPreset {
  campaign: CampaignPresetCampaign
  proxies: CampaignPresetProxy[]
  targets: CampaignPresetTarget[]
  redirectors: CampaignPresetRedirector[]
  lures: CampaignPresetLure[]
}

/**
 * @category Campaign
 * @internal
 */
export interface RawCampaignPreset {
  campaign: RawCampaignPresetCampaign
  proxies?: RawCampaignPresetProxy[] | null | undefined
  targets?: RawCampaignPresetTarget[] | null | undefined
  redirectors?: RawCampaignPresetRedirector[] | null | undefined
  lures?: RawCampaignPresetLure[] | null | undefined
}

import { TargetAccessLevel } from '@famir/database'

/**
 * Represents a phishmap campaign.
 *
 * @category Phishmap
 * @internal
 */
export interface PhishmapCampaign {
  campaignId: string
  mirrorDomain: string
  description: string
  upgradeSessionPath: string
  sessionCookieName: string
  sessionExpire: number
  newSessionExpire: number
  messageExpire: number
}

/**
 * Represents a phishmap proxy.
 *
 * @category Phishmap
 * @internal
 */
export interface PhishmapProxy {
  proxyId: string
  url: string
  isEnabled: boolean
}

/**
 * Represents a phishmap target.
 *
 * @category Phishmap
 * @internal
 */
export interface PhishmapTarget {
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
 * Represents a phishmap redirector.
 *
 * @category Phishmap
 * @internal
 */
export interface PhishmapRedirector {
  redirectorId: string
  page: string
  fields: string[]
}

/**
 * Represents a phishmap lure.
 *
 * @category Phishmap
 * @internal
 */
export interface PhishmapLure {
  lureId: string
  path: string
  redirectorId: string
  isEnabled: boolean
}

/**
 * Represents a phishmap.
 *
 * @category Phishmap
 */
export interface Phishmap {
  campaign: PhishmapCampaign
  proxies: PhishmapProxy[]
  targets: PhishmapTarget[]
  redirectors: PhishmapRedirector[]
  lures: PhishmapLure[]
}

/**
 * Represents a dump phishmap args.
 *
 * @category Phishmap
 * @internal
 */
export interface DumpPhishmapArgs {
  _: [string]
  file: string
}

/**
 * Represents a restore phishmap args.
 *
 * @category Phishmap
 * @internal
 */
export interface RestorePhishmapArgs {
  _: string[]
  file: string
  campaignId?: string | null | undefined
  mirrorDomain?: string | null | undefined
  description?: string | null | undefined
  cryptSecret?: string | null | undefined
  upgradeSessionPath?: string | null | undefined
  sessionCookieName?: string | null | undefined
  sessionExpire?: number | null | undefined
  newSessionExpire?: number | null | undefined
  messageExpire?: number | null | undefined
}

/**
 * Represents a purge phishmap args.
 *
 * @category Phishmap
 * @internal
 */
export interface PurgePhishmapArgs {
  _: [string]
  force: boolean
}

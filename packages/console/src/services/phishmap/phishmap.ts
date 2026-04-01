import { TargetAccessLevel } from '@famir/database'

export const PHISHMAP_SERVICE = Symbol('PhishmapService')

export interface PhishmapCampaign {
  campaignId: string
  mirrorDomain: string
  description: string
  landingUpgradePath: string
  sessionCookieName: string
  sessionExpire: number
  newSessionExpire: number
  messageExpire: number
}

export interface PhishmapProxy {
  proxyId: string
  url: string
  isEnabled: boolean
}

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

export interface PhishmapRedirector {
  redirectorId: string
  page: string
}

export interface PhishmapLure {
  lureId: string
  path: string
  redirectorId: string
  isEnabled: boolean
}

export interface Phishmap {
  campaign: PhishmapCampaign
  proxies: PhishmapProxy[]
  targets: PhishmapTarget[]
  redirectors: PhishmapRedirector[]
  lures: PhishmapLure[]
}

export interface DumpPhishmapData {
  campaignId: string
}

export interface RestorePhishmapData {
  phishmap: Phishmap
  campaignId?: string | null | undefined
  mirrorDomain?: string | null | undefined
  description?: string | null | undefined
  cryptSecret?: string | null | undefined
  landingUpgradePath?: string | null | undefined
  sessionCookieName?: string | null | undefined
  sessionExpire?: number | null | undefined
  newSessionExpire?: number | null | undefined
  messageExpire?: number | null | undefined
}

export interface PurgePhishmapData {
  campaignId: string
}

export interface PhishmapCampaign {
  campaignId: string
  mirrorDomain: string
  description: string
  lockTimeout: number
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
  isLanding: boolean
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
  campaignId?: string
  mirrorDomain?: string
  description?: string
  lockTimeout?: number
  landingUpgradePath?: string
  sessionCookieName?: string
  sessionExpire?: number
  newSessionExpire?: number
  messageExpire?: number
}

export interface PrunePhishmapData {
  campaignId: string
  confirmSecret?: string
}

export interface LoadPhishmapData {
  filename: string
}

export interface SavePhishmapData {
  phishmap: Phishmap
  filename: string
}

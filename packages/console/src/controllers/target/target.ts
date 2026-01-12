export interface CreateTargetData {
  campaignId: string
  targetId: string
  isLanding: boolean
  donorSecure: boolean
  donorSub: string
  donorDomain: string
  donorPort: number
  mirrorSecure: boolean
  mirrorSub: string
  mirrorPort: number
  connectTimeout: number
  ordinaryTimeout: number
  streamingTimeout: number
  requestBodyLimit: number
  responseBodyLimit: number
  mainPage: string
  notFoundPage: string
  faviconIco: string
  robotsTxt: string
  sitemapXml: string
  lockCode: number
}

export interface ReadTargetData {
  campaignId: string
  targetId: string
}

export interface UpdateTargetData {
  campaignId: string
  targetId: string
  connectTimeout: number | null | undefined
  ordinaryTimeout: number | null | undefined
  streamingTimeout: number | null | undefined
  requestBodyLimit: number | null | undefined
  responseBodyLimit: number | null | undefined
  mainPage: string | null | undefined
  notFoundPage: string | null | undefined
  faviconIco: string | null | undefined
  robotsTxt: string | null | undefined
  sitemapXml: string | null | undefined
  lockCode: number
}

export interface SwitchTargetData {
  campaignId: string
  targetId: string
  lockCode: number
}

export interface ActionTargetLabelData {
  campaignId: string
  targetId: string
  label: string
  lockCode: number
}

export interface DeleteTargetData {
  campaignId: string
  targetId: string
  lockCode: number
}

export interface ListTargetsData {
  campaignId: string
}

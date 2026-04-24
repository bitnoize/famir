import { TargetAccessLevel } from '@famir/database'

/**
 * @category Target
 * @internal
 */
export const TARGET_CONTROLLER = Symbol('TargetController')

/**
 * @category Target
 * @internal
 */
export const TARGET_SERVICE = Symbol('TargetService')

/**
 * @category Target
 */
export interface CreateTargetData {
  campaignId: string
  targetId: string
  accessLevel: TargetAccessLevel
  donorSecure: boolean
  donorSub: string
  donorDomain: string
  donorPort: number
  mirrorSecure: boolean
  mirrorSub: string
  mirrorPort: number
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
  lockSecret: string
}

/**
 * @category Target
 */
export interface ReadTargetData {
  campaignId: string
  targetId: string
}

/**
 * @category Target
 */
export interface UpdateTargetData {
  campaignId: string
  targetId: string
  connectTimeout: number | null | undefined
  simpleTimeout: number | null | undefined
  streamTimeout: number | null | undefined
  headersSizeLimit: number | null | undefined
  bodySizeLimit: number | null | undefined
  mainPage: string | null | undefined
  notFoundPage: string | null | undefined
  faviconIco: string | null | undefined
  robotsTxt: string | null | undefined
  sitemapXml: string | null | undefined
  allowWebSockets: boolean | null | undefined
  lockSecret: string
}

/**
 * @category Target
 */
export interface ToggleTargetData {
  campaignId: string
  targetId: string
  lockSecret: string
}

/**
 * @category Target
 */
export interface AlterTargetLabelData {
  campaignId: string
  targetId: string
  label: string
  lockSecret: string
}

/**
 * @category Target
 */
export interface DeleteTargetData {
  campaignId: string
  targetId: string
  lockSecret: string
}

/**
 * @category Target
 */
export interface ListTargetsData {
  campaignId: string
}

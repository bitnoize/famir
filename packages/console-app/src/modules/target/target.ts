import { TargetAccessLevel } from '@famir/database'

/**
 * Arguments for creating a target.
 *
 * @category Target
 * @internal
 */
export interface CreateTargetArgs {
  _: [string, string]
  accessLevel: TargetAccessLevel
  donorSecure: boolean
  donorSub: string
  donorDomain: string
  donorPort?: number | null | undefined
  mirrorSecure: boolean
  mirrorSub: string
  mirrorPort?: number | null | undefined
  connectTimeout: number
  simpleTimeout: number
  streamTimeout: number
  headersSizeLimit: number
  bodySizeLimit: number
  mainPageFile: string | null | undefined
  notFoundPageFile: string | null | undefined
  faviconIcoFile: string | null | undefined
  robotsTxtFile: string | null | undefined
  sitemapXmlFile: string | null | undefined
  allowWebSockets: boolean
  lockSecret: string
}

/**
 * Arguments for reading the target.
 *
 * @category Target
 * @internal
 */
export interface ReadTargetArgs {
  _: [string, string]
}

/**
 * Arguments for reading the target hosts.
 *
 * @category Target
 * @internal
 */
export interface ReadTargetHostsArgs {
  _: string[]
}

/**
 * Arguments for updating the target.
 *
 * @category Target
 * @internal
 */
export interface UpdateTargetArgs {
  _: [string, string]
  connectTimeout: number | null | undefined
  simpleTimeout: number | null | undefined
  streamTimeout: number | null | undefined
  headersSizeLimit: number | null | undefined
  bodySizeLimit: number | null | undefined
  mainPageFile: string | null | undefined
  notFoundPageFile: string | null | undefined
  faviconIcoFile: string | null | undefined
  robotsTxtFile: string | null | undefined
  sitemapXmlFile: string | null | undefined
  allowWebSockets: boolean | null | undefined
  lockSecret: string
}

/**
 * Arguments for toggling the target.
 *
 * @category Target
 * @internal
 */
export interface ToggleTargetArgs {
  _: [string, string]
  lockSecret: string
}

/**
 * Arguments for altering the target label.
 *
 * @category Target
 * @internal
 */
export interface AlterTargetLabelArgs {
  _: [string, string]
  label: string
  lockSecret: string
}

/**
 * Arguments for deleting the target.
 *
 * @category Target
 * @internal
 */
export interface DeleteTargetArgs {
  _: [string, string]
  lockSecret: string
}

/**
 * Arguments for listing targets.
 *
 * @category Target
 * @internal
 */
export interface ListTargetsArgs {
  _: [string]
}

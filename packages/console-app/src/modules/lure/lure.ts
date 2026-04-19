import { RedirectorParams } from '@famir/database'

/**
 * @category Lure
 * @internal
 */
export const LURE_CONTROLLER = Symbol('LureController')

/**
 * @category Lure
 * @internal
 */
export const LURE_SERVICE = Symbol('LureService')

/**
 * @category Lure
 */
export interface CreateLureData {
  campaignId: string
  lureId: string
  path: string
  redirectorId: string
  lockSecret: string
}

/**
 * @category Lure
 */
export interface ReadLureData {
  campaignId: string
  lureId: string
}

/**
 * @category Lure
 */
export interface ReadLurePathData {
  campaignId: string
  path: string
}

/**
 * @category Lure
 */
export interface ToggleLureData {
  campaignId: string
  lureId: string
  lockSecret: string
}

/**
 * @category Lure
 */
export interface DeleteLureData {
  campaignId: string
  lureId: string
  redirectorId: string
  lockSecret: string
}

/**
 * @category Lure
 */
export interface ListLuresData {
  campaignId: string
}

/**
 * @category Lure
 */
export interface MakeLureUrlData {
  campaignId: string
  targetId: string
  lureId: string
  params: RedirectorParams
}

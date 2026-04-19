import { RedirectorParams } from '@famir/database'

/**
 * @category DI
 */
export const LURE_SERVICE = Symbol('LureService')

/**
 * @category Data
 */
export interface CreateLureData {
  campaignId: string
  lureId: string
  path: string
  redirectorId: string
  lockSecret: string
}

/**
 * @category Data
 */
export interface ReadLureData {
  campaignId: string
  lureId: string
}

/**
 * @category Data
 */
export interface ReadLurePathData {
  campaignId: string
  path: string
}

/**
 * @category Data
 */
export interface SwitchLureData {
  campaignId: string
  lureId: string
  lockSecret: string
}

/**
 * @category Data
 */
export interface DeleteLureData {
  campaignId: string
  lureId: string
  redirectorId: string
  lockSecret: string
}

/**
 * @category Data
 */
export interface ListLuresData {
  campaignId: string
}

/**
 * @category Data
 */
export interface MakeLureUrlData {
  campaignId: string
  targetId: string
  lureId: string
  params: RedirectorParams
}

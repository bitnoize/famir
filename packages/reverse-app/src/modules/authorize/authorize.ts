import { EnabledFullTargetModel, FullCampaignModel, TargetAccessLevel } from '@famir/database'
import {
  HttpServerContext,
  HttpServerContextType,
  HttpServerNextFunction,
} from '@famir/http-server'

/**
 * @category Authorize
 * @internal
 */
export const AUTHORIZE_CONTROLLER = Symbol('AuthorizeController')

/**
 * @category Authorize
 * @internal
 */
export const AUTHORIZE_SERVICE = Symbol('AuthorizeService')

/**
 * @category Authorize
 * @internal
 */
export type AuthorizeHandler = (
  ctx: HttpServerContext,
  campaign: FullCampaignModel,
  target: EnabledFullTargetModel,
  next: HttpServerNextFunction
) => Promise<void>

/**
 * @category Authorize
 * @internal
 */
export type AuthorizeDispatchContextType = Record<HttpServerContextType, AuthorizeHandler>

/**
 * @category Authorize
 * @internal
 */
export type AuthorizeDispatchAccessLevel = Record<TargetAccessLevel, AuthorizeHandler>

/**
 * @category Authorize
 */
export interface ReadProxyData {
  campaignId: string
  proxyId: string
}

/**
 * @category Authorize
 */
export interface ReadRedirectorData {
  campaignId: string
  redirectorId: string
}

/**
 * @category Authorize
 */
export interface FindLureData {
  campaignId: string
  path: string
}

/**
 * @category Authorize
 */
export interface CreateSessionData {
  campaignId: string
}

/**
 * @category Authorize
 */
export interface AuthSessionData {
  campaignId: string
  sessionId: string
}

/**
 * @category Authorize
 */
export interface UpgradeSessionData {
  campaignId: string
  lureId: string
  sessionId: string
  secret: string
}

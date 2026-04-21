import { EnabledFullTargetModel, FullCampaignModel, TargetAccessLevel } from '@famir/database'
import {
  HttpServerContext,
  HttpServerContextType,
  HttpServerNextFunction,
} from '@famir/http-server'

/**
 * @category none
 * @internal
 */
export const AUTHORIZE_CONTROLLER = Symbol('AuthorizeController')

/**
 * @category none
 * @internal
 */
export const AUTHORIZE_SERVICE = Symbol('AuthorizeService')

export type AuthorizeHandler = (
  ctx: HttpServerContext,
  campaign: FullCampaignModel,
  target: EnabledFullTargetModel,
  next: HttpServerNextFunction
) => Promise<void>

export type AuthorizeDispatchContextType = Record<HttpServerContextType, AuthorizeHandler>
export type AuthorizeDispatchAccessLevel = Record<TargetAccessLevel, AuthorizeHandler>

export interface ReadProxyData {
  campaignId: string
  proxyId: string
}

export interface ReadRedirectorData {
  campaignId: string
  redirectorId: string
}

export interface FindLureData {
  campaignId: string
  path: string
}

export interface CreateSessionData {
  campaignId: string
}

export interface AuthSessionData {
  campaignId: string
  sessionId: string
}

export interface UpgradeSessionData {
  campaignId: string
  lureId: string
  sessionId: string
  secret: string
}

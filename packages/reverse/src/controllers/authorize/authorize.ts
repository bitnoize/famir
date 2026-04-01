import { EnabledFullTargetModel, FullCampaignModel, TargetAccessLevel } from '@famir/database'
import {
  HttpServerContext,
  HttpServerContextType,
  HttpServerNextFunction
} from '@famir/http-server'

export const AUTHORIZE_CONTROLLER = Symbol('AuthorizeController')

export type AuthorizeHandler = (
  ctx: HttpServerContext,
  campaign: FullCampaignModel,
  target: EnabledFullTargetModel,
  next: HttpServerNextFunction
) => Promise<void>

export type AuthorizeDispatchContextType = Record<HttpServerContextType, AuthorizeHandler>
export type AuthorizeDispatchAccessLevel = Record<TargetAccessLevel, AuthorizeHandler>

export interface LandingUpgradePayload {
  lure_id: string
  session_id: string
  secret: string
  back_url: string
}

export type LandingLurePayload = Record<string, string>

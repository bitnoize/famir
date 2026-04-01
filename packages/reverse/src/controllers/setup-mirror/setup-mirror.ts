import { type EnabledFullTargetModel, type FullCampaignModel } from '@famir/database'
import {
  HttpServerContext,
  HttpServerContextType,
  HttpServerNextFunction
} from '@famir/http-server'
import { type HttpMessage } from '@famir/http-tools'

export const SETUP_MIRROR_CONTROLLER = Symbol('SetupMirrorController')

export type SetupMirrorHandler = (
  ctx: HttpServerContext,
  campaign: FullCampaignModel,
  target: EnabledFullTargetModel,
  message: HttpMessage,
  next: HttpServerNextFunction
) => Promise<void>

export type SetupMirrorDispatchContextType = Record<HttpServerContextType, SetupMirrorHandler>

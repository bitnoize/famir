import { type EnabledFullTargetModel, type FullCampaignModel } from '@famir/database'
import {
  HttpServerContext,
  HttpServerContextType,
  HttpServerNextFunction,
} from '@famir/http-server'
import { type HttpMessage } from '@famir/http-tools'

/**
 * @category SetupMirror
 * @internal
 */
export const SETUP_MIRROR_CONTROLLER = Symbol('SetupMirrorController')

/**
 * @category SetupMirror
 * @internal
 */
export const SETUP_MIRROR_SERVICE = Symbol('SetupMirrorService')

/**
 * @category SetupMirror
 * @internal
 */
export type SetupMirrorHandler = (
  ctx: HttpServerContext,
  campaign: FullCampaignModel,
  target: EnabledFullTargetModel,
  message: HttpMessage,
  next: HttpServerNextFunction
) => Promise<void>

/**
 * @category SetupMirror
 * @internal
 */
export type SetupMirrorDispatchContextType = Record<HttpServerContextType, SetupMirrorHandler>

/**
 * @category SetupMirror
 */
export interface FindTargetData {
  mirrorHost: string
}

import {
  HttpType,
  TargetAccessLevel,
  type EnabledFullTargetModel,
  type EnabledProxyModel,
  type FullCampaignModel,
  type SessionModel,
  type TargetModel,
} from '@famir/domain'
import {
  HttpServerContextState,
  HttpServerContextType,
  HttpServerMiddleware,
} from '@famir/http-server'
import { type HttpMessage } from '@famir/http-tools'

/**
 * Represents the reverse context state.
 *
 * @category none
 */
export interface ReverseContextState extends HttpServerContextState {
  campaign?: FullCampaignModel
  proxy?: EnabledProxyModel
  target?: EnabledFullTargetModel
  targets?: TargetModel[]
  session?: SessionModel
  message?: HttpMessage
}

/**
 * Represents the reverse dispatch table by HTTP type.
 *
 * @category none
 */
export type ReverseDispatchHttpType = Record<HttpType, HttpServerMiddleware>

/**
 * Represents the reverse dispatch table by context type.
 *
 * @category none
 */
export type ReverseDispatchContextType = Record<HttpServerContextType, HttpServerMiddleware>

/**
 * Represents the reverse dispatch table by target access level.
 *
 * @category none
 */
export type ReverseDispatchTargetAccessLevel = Record<TargetAccessLevel, HttpServerMiddleware>

/**
 * Represents the reverse dispatch table by target label.
 *
 * @category none
 */
export type ReverseDispatchTargetLabel = Record<string, HttpServerMiddleware>

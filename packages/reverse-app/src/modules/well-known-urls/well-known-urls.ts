import { type EnabledFullTargetModel } from '@famir/database'
import {
  HttpServerContext,
  HttpServerContextType,
  HttpServerNextFunction,
} from '@famir/http-server'

/**
 * @category WellKnownUrls
 * @internal
 */
export const WELL_KNOWN_URLS_CONTROLLER = Symbol('WellKnownUrlsController')

/**
 * @category WellKnownUrls
 * @internal
 */
export type WellKnownUrlsHandler = (
  ctx: HttpServerContext,
  target: EnabledFullTargetModel,
  next: HttpServerNextFunction
) => Promise<void>

/**
 * @category WellKnownUrls
 * @internal
 */
export type WellKnownUrlsDispatchContextType = Record<HttpServerContextType, WellKnownUrlsHandler>

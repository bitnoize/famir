import { type EnabledFullTargetModel } from '@famir/database'
import {
  HttpServerContext,
  HttpServerContextType,
  HttpServerNextFunction,
} from '@famir/http-server'

export const WELL_KNOWN_URLS_CONTROLLER = Symbol('WellKnownUrlsController')

export type WellKnownUrlsHandler = (
  ctx: HttpServerContext,
  target: EnabledFullTargetModel,
  next: HttpServerNextFunction
) => Promise<void>

export type WellKnownUrlsDispatchContextType = Record<HttpServerContextType, WellKnownUrlsHandler>

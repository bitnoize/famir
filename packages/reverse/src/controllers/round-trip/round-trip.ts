import { EnabledFullTargetModel, EnabledProxyModel } from '@famir/database'
import { HttpType } from '@famir/http-proto'
import { HttpServerContext, HttpServerNextFunction } from '@famir/http-server'
import { type HttpMessage } from '@famir/http-tools'

export const ROUND_TRIP_CONTROLLER = Symbol('RoundTripController')

export type RoundTripHandler = (
  ctx: HttpServerContext,
  proxy: EnabledProxyModel,
  target: EnabledFullTargetModel,
  message: HttpMessage,
  next: HttpServerNextFunction
) => Promise<void>

export type RoundTripDispatchHttpType = Record<HttpType, RoundTripHandler>

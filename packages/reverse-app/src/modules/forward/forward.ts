import { EnabledFullTargetModel, EnabledProxyModel } from '@famir/database'
import { HttpBody, HttpHeaders, HttpMethod, HttpType } from '@famir/http-proto'
import { HttpServerContext, HttpServerNextFunction } from '@famir/http-server'
import { type HttpMessage } from '@famir/http-tools'
import type { Readable } from 'node:stream'

/**
 * @category Forward
 * @internal
 */
export const FORWARD_CONTROLLER = Symbol('ForwardController')

/**
 * @category Forward
 * @internal
 */
export const FORWARD_SERVICE = Symbol('ForwardService')

/**
 * @category Forward
 * @internal
 */
export type ForwardHandler = (
  ctx: HttpServerContext,
  proxy: EnabledProxyModel,
  target: EnabledFullTargetModel,
  message: HttpMessage,
  next: HttpServerNextFunction
) => Promise<void>

/**
 * @category Forward
 * @internal
 */
export type ForwardDispatchHttpType = Record<HttpType, ForwardHandler>

/**
 * @category Forward
 */
export interface ForwardSimpleData {
  proxy: string
  method: HttpMethod
  url: string
  requestHeaders: HttpHeaders
  requestBody: HttpBody
  connectTimeout: number
  timeout: number
  headersSizeLimit: number
  bodySizeLimit: number
}

/**
 * @category Forward
 */
export interface ForwardStreamRequestData {
  proxy: string
  method: HttpMethod
  url: string
  requestHeaders: HttpHeaders
  requestStream: Readable
  connectTimeout: number
  timeout: number
  headersSizeLimit: number
  bodySizeLimit: number
}

/**
 * @category Forward
 */
export interface ForwardStreamResponseData {
  proxy: string
  method: HttpMethod
  url: string
  requestHeaders: HttpHeaders
  requestBody: HttpBody
  connectTimeout: number
  timeout: number
  headersSizeLimit: number
}

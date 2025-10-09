import { ParsedQs } from 'qs'
import {
  CampaignModel,
  EnabledLureModel,
  EnabledProxyModel,
  EnabledTargetModel,
  RedirectorModel,
  SessionModel
} from '../../models/index.js'
import { CreateMessageModel } from '../../repositories/index.js'

export interface HttpServer {
  listen(): Promise<void>
  close(): Promise<void>
}

export const HTTP_SERVER = Symbol('HttpServer')

export type HttpServerRouteMethod =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'

export type HttpServerReqResHeaders = Record<string, string | string[] | undefined>

export type HttpServerRequestParams = Record<string, string>
export type HttpServerRequestQuery = ParsedQs
export type HttpServerRequestCookies = Record<string, string>

export interface HttpServerRequestLocals {
  campaign?: CampaignModel
  proxy?: EnabledProxyModel
  target?: EnabledTargetModel
  targets?: EnabledTargetModel[]
  redirector?: RedirectorModel
  lure?: EnabledLureModel
  session?: SessionModel
  message?: CreateMessageModel
}

export interface HttpServerRequest {
  ip: string
  host: string
  method: string
  url: string
  path: string
  params: HttpServerRequestParams
  query: HttpServerRequestQuery
  headers: HttpServerReqResHeaders
  cookies: HttpServerRequestCookies
  body: Buffer
  locals: HttpServerRequestLocals
}

export interface HttpServerResponseCookie {
  value: string | undefined
  maxAge?: number | undefined
  expires?: Date | undefined
  httpOnly?: boolean | undefined
  path?: string | undefined
  domain?: string | undefined
  secure?: boolean | undefined
  sameSite?: boolean | 'lax' | 'strict' | 'none' | undefined
  //priority?: 'low' | 'medium' | 'high'
  //partitioned?: boolean | undefined
}

export type HttpServerResponseCookies = Record<string, HttpServerResponseCookie>

export interface HttpServerResponse {
  status: number
  headers: HttpServerReqResHeaders
  cookies: HttpServerResponseCookies
  body: Buffer
}

export type HttpServerRouteHandler = (
  request: HttpServerRequest
) => Promise<HttpServerResponse | undefined>

export interface HttpServerRouter {
  applyTo(express: unknown): void
  setHandler(method: HttpServerRouteMethod, path: string, handler: HttpServerRouteHandler): void
}

export const HTTP_SERVER_ROUTER = Symbol('HttpServerRouter')

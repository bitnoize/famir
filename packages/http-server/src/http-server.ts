export interface HttpServerConfig {
  HTTP_SERVER_ADDRESS: string
  HTTP_SERVER_PORT: number
  HTTP_SERVER_BODY_LIMIT: number
}

export interface HttpServerOptions {
  address: string
  port: number
  bodyLimit: number
}

export interface HttpServer {
  listen(): Promise<void>
  close(): Promise<void>
}

export type RequestLocals = Record<string, unknown>

export type RouteMethod = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'

export interface WrapRequest {
  ip: string | undefined
  host: string
  method: string
  url: string
  path: string
  params: Record<string, string> | string[]
  query: Record<string, unknown>
  headers: Record<string, string | string[] | undefined>
  cookies: Record<string, string>
  body: Buffer | undefined
}

export interface ResponseCookieOptions {
  maxAge?: number | undefined
  expires?: Date | undefined
  httpOnly?: boolean | undefined
  path?: string | undefined
  domain?: string | undefined
  secure?: boolean | undefined
  sameSite?: boolean | 'lax' | 'strict' | 'none' | undefined
  priority?: 'low' | 'medium' | 'high'
  partitioned?: boolean | undefined
}

export interface WrapResponse {
  status: number
  headers: Record<string, string | string[] | undefined>
  cookies: Record<string, [string | undefined, ResponseCookieOptions]>
  body: Buffer | undefined
}

export type RouteHandler = (
  locals: RequestLocals,
  request: WrapRequest
) => Promise<WrapResponse | null | undefined>

export interface Router {
  addRoute(method: RouteMethod, path: string, handler: RouteHandler): void
  applyTo(express: unknown): void
}

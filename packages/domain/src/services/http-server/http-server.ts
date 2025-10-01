export interface HttpServer {
  listen(): Promise<void>
  close(): Promise<void>
}

export type HttpServerLocals = Record<string, unknown>

export type HttpServerRouteMethod =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'

export interface HttpServerRequest {
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

// FIXME
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

export interface HttpServerResponse {
  status: number
  headers: Record<string, string | string[] | undefined>
  cookies: Record<string, [string | undefined, ResponseCookieOptions]>
  body: Buffer | undefined
}

export type HttpServerRouteHandler = (
  locals: HttpServerLocals,
  request: HttpServerRequest
) => Promise<HttpServerResponse | null | undefined>

export interface HttpServerRouter {
  applyTo(express: unknown): void
  setHandler(method: HttpServerRouteMethod, path: string, handler: HttpServerRouteHandler): void
}

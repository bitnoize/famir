import {
  HttpBodyWrap,
  HttpConnection,
  HttpHeadersWrap,
  HttpMethodWrap,
  HttpStatusWrap,
  HttpUrlWrap,
  UAResult
} from '@famir/http-tools'
import type { Readable, Writable } from 'node:stream'

export const HTTP_SERVER = Symbol('HttpServer')

export interface HttpServer {
  start(): Promise<void>
  stop(): Promise<void>
}

export type HttpServerContextState = Record<string, unknown>

export interface HttpServerContext {
  readonly state: HttpServerContextState
  readonly middlewares: string[]
  readonly verbose: boolean
  readonly errorPage: string
  readonly method: HttpMethodWrap
  readonly url: HttpUrlWrap
  readonly requestHeaders: HttpHeadersWrap
  readonly requestBody: HttpBodyWrap
  readonly status: HttpStatusWrap
  readonly responseHeaders: HttpHeadersWrap
  readonly responseBody: HttpBodyWrap
  readonly requestStream: Readable
  readonly responseStream: Writable
  loadRequest(bodySizeLimit: number): Promise<void>
  sendHead(): void
  sendResponse(): Promise<void>
  readonly isBot: boolean
  readonly userAgent: UAResult
  readonly ip: string
  readonly connection: HttpConnection
  readonly startTime: number
  readonly finishTime: number
  readonly isComplete: boolean
}
export type HttpServerNextFunction = () => Promise<void>

export type HttpServerMiddleware = (
  ctx: HttpServerContext,
  next: HttpServerNextFunction
) => Promise<void>

export type HttpServerMiddlewares = [string, HttpServerMiddleware][]

export interface NativeHttpServerConfig {
  HTTP_SERVER_ADDRESS: string
  HTTP_SERVER_PORT: number
  HTTP_SERVER_VERBOSE: boolean
}

export interface NativeHttpServerOptions {
  address: string
  port: number
  verbose: boolean
}

export const HTTP_SERVER_ERROR_PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Error</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      background-color: #f4f4f4;
      color: #2c3e50;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 16px;
    }

    .error-card {
      max-width: 560px;
      width: 100%;
      background: white;
      padding: 2.5rem 2rem;
      border-radius: 20px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
      text-align: center;
      border: 1px solid #eaeef2;
    }

    .error-status {
      font-size: 6rem;
      font-weight: 600;
      line-height: 1.1;
      color: #3a4a5a;
      letter-spacing: -2px;
      margin-bottom: 0.75rem;
    }

    .error-message {
      font-size: 1.8rem;
      font-weight: 350;
      color: #4f5f6f;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      word-break: break-word;
    }

    @media (max-width: 480px) {
      .error-status {
          font-size: 4.5rem;
      }
      .error-message {
          font-size: 1.5rem;
      }
      .error-card {
          padding: 2rem 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="error-card">
    <div class="error-status"><%= data.status %></div>
    <div class="error-message"><%= data.message %></div>
  </div>
</body>
</html>`

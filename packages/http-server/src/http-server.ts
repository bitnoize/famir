import {
  HttpBodyWrap,
  HttpConnection,
  HttpHeadersWrap,
  HttpMethodWrap,
  HttpStatusWrap,
  HttpUrlWrap
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
  readonly method: HttpMethodWrap
  readonly url: HttpUrlWrap
  readonly requestHeaders: HttpHeadersWrap
  readonly requestBody: HttpBodyWrap
  readonly status: HttpStatusWrap
  readonly responseHeaders: HttpHeadersWrap
  readonly responseBody: HttpBodyWrap
  readonly requestStream: Readable
  readonly responseStream: Writable
  loadRequest(bodyLimit: number): Promise<void>
  sendHead(): void
  sendResponse(): Promise<void>
  readonly isBot: boolean
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
}

export interface NativeHttpServerOptions {
  address: string
  port: number
}

export const HTTP_SERVER_ERROR_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            color: #2e2e2e;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            line-height: 1.5;
        }

        .error-card {
            max-width: 620px;
            width: 100%;
            background-color: #ffffff;
            border: 1px solid #d1d1d1;
            border-radius: 24px;
            padding: 3rem 2.5rem;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.02);
            text-align: center;
            transition: all 0.1s ease;
        }

        .error-status {
            font-size: 7rem;
            font-weight: 700;
            line-height: 1;
            color: #9f9f9f;
            letter-spacing: -0.02em;
            margin-bottom: 0.75rem;
            text-shadow: 0 2px 5px rgba(128, 128, 128, 0.10);
        }

        .error-message {
            font-size: 1.8rem;
            font-weight: 400;
            color: #5a5a5a;
            margin-bottom: 1.5rem;
            border-bottom: 1px dashed #c9c9c9;
            padding-bottom: 1.5rem;
            word-break: break-word;
        }

        .error-footnote {
            font-size: 0.95rem;
            color: #8e8e8e;
            border-top: 1px solid #e2e2e2;
            padding-top: 1.5rem;
            margin-top: 0.5rem;
        }

        .error-footnote a {
            color: #6f6f6f;
            text-decoration: none;
            border-bottom: 1px dotted #bebebe;
        }

        .error-footnote a:hover {
            color: #3a3a3a;
            border-bottom: 1px solid #7f7f7f;
        }

        @media (max-width: 480px) {
            .error-card {
                padding: 2rem 1.5rem;
            }
            .error-status {
                font-size: 5rem;
            }
            .error-message {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="error-card">
        <div class="error-status"><%= data.status %></div>

        <div class="error-message"><%= data.message %></div>

        <div class="error-footnote">
            <span>... bla bla bla ...</span>
        </div>
    </div>
</body>
</html>`

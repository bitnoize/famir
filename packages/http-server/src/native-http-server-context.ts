import { DIContainer, HttpBody, HttpConnection } from '@famir/common'
import {
  HttpBodyWrap,
  HttpHeadersWrap,
  HttpMethodWrap,
  HttpStatusWrap,
  HttpUrlWrap,
  isbot,
  UAParser,
  UAResult,
} from '@famir/http-tools'
import http from 'node:http'
import { Duplex, Readable, Writable } from 'node:stream'
import WebSocket, { createWebSocketStream } from 'ws'
import { HttpServerError } from './http-server.error.js'
import {
  HTTP_SERVER_CONTEXT_FACTORY,
  HttpServerContext,
  HttpServerContextFactory,
  HttpServerContextState,
  HttpServerContextType,
} from './http-server.js'

/**
 * Native HTTP server context factory implementation
 * @category none
 */
export class NativeHttpServerContextFactory implements HttpServerContextFactory {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<HttpServerContextFactory>(
      HTTP_SERVER_CONTEXT_FACTORY,
      () => new NativeHttpServerContextFactory()
    )
  }

  createNormal(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    state: HttpServerContextState
  ): HttpServerContext {
    return new NativeHttpServerNormalContext(req, res, state)
  }

  createWebSocket(
    ws: WebSocket,
    req: http.IncomingMessage,
    state: HttpServerContextState
  ): HttpServerContext {
    return new NativeHttpServerWebSocketContext(ws, req, state)
  }
}

/**
 * Native HTTP server base context
 * @category none
 */
export abstract class NativeHttpServerBaseContext {
  readonly middlewares: string[] = []

  readonly method: HttpMethodWrap
  readonly url: HttpUrlWrap
  readonly requestHeaders: HttpHeadersWrap
  readonly requestBody: HttpBodyWrap
  readonly status: HttpStatusWrap
  readonly responseHeaders: HttpHeadersWrap
  readonly responseBody: HttpBodyWrap

  constructor(
    readonly type: HttpServerContextType,
    protected readonly req: http.IncomingMessage,
    readonly state: HttpServerContextState
  ) {
    try {
      this.method = HttpMethodWrap.fromReq(req)
      this.url = HttpUrlWrap.fromReq(req)
      this.requestHeaders = HttpHeadersWrap.fromReq(req)
      this.requestBody = HttpBodyWrap.fromScratch()
      this.status = HttpStatusWrap.fromScratch()
      this.responseHeaders = HttpHeadersWrap.fromScratch()
      this.responseBody = HttpBodyWrap.fromScratch()
    } catch (error) {
      throw new HttpServerError(`Bad request`, {
        cause: error,
        context: {
          reason: `Create context failed`,
        },
        code: 'BAD_REQUEST',
      })
    }
  }

  abstract get requestStream(): Readable

  abstract get responseStream(): Writable

  abstract loadRequest(bodySizeLimit: number): Promise<void>

  abstract sendHead(): void

  abstract sendResponse(): Promise<void>

  abstract close(): void

  abstract get isComplete(): boolean

  #isBot: boolean | null = null

  get isBot(): boolean {
    if (this.#isBot != null) {
      return this.#isBot
    }

    const value = this.requestHeaders.getString('User-Agent') ?? ''

    this.#isBot = isbot(value)

    return this.#isBot
  }

  #userAgent: UAResult | null = null

  get userAgent(): UAResult {
    if (this.#userAgent != null) {
      return this.#userAgent
    }

    const value = this.requestHeaders.getString('User-Agent') ?? ''

    this.#userAgent = UAParser(value)

    return this.#userAgent
  }

  get clientIp(): string | undefined {
    return this.requestHeaders.getString('X-Real-Ip')
  }

  get connection(): HttpConnection {
    return {
      server_client_ip: this.clientIp ?? null,
      server_forwarded_for: this.requestHeaders.getString('X-Forwarded-For') ?? null,
      server_forwarded_host: this.requestHeaders.getString('X-Forwarded-Host') ?? null,
      server_forwarded_proto: this.requestHeaders.getString('X-Forwarded-Proto') ?? null,
    }
  }

  readonly startTime: number = Date.now()

  finishTime: number = 0

  protected loadRequestBody(requestStream: Readable, bodySizeLimit: number): Promise<HttpBody> {
    return new Promise<HttpBody>((resolve, reject) => {
      if (!(bodySizeLimit > 0)) {
        reject(new Error(`Wrong loadRequestBody params`))

        return
      }

      const chunks: Buffer[] = []
      let requestBodySize = 0

      requestStream.on('data', (chunk: Buffer) => {
        if (requestBodySize + chunk.length > bodySizeLimit) {
          requestStream.destroy()

          reject(
            new HttpServerError(`Content too large`, {
              context: {
                reason: `Request body size limit exceeded`,
              },
              code: 'CONTENT_TOO_LARGE',
            })
          )

          return
        }

        chunks.push(chunk)

        requestBodySize += chunk.length
      })

      requestStream.on('end', () => {
        const requestBody = this.parseRawBody(chunks)

        resolve(requestBody)
      })

      requestStream.on('error', (error) => {
        reject(
          new HttpServerError(`Bad request`, {
            cause: error,
            context: {
              reason: `Load request body failed`,
            },
            code: 'BAD_REQUEST',
          })
        )
      })
    })
  }

  protected sendResponseBody(responseStream: Writable, responseBody: HttpBody): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      responseStream.end(responseBody, (error?: Error) => {
        if (error) {
          reject(
            new HttpServerError(`Server internal error`, {
              cause: error,
              context: {
                reason: `Send response body failed`,
              },
              code: 'INTERNAL_ERROR',
            })
          )

          return
        }

        resolve()
      })
    })
  }

  private parseRawBody(chunks: Buffer[]): HttpBody {
    try {
      return Buffer.concat(chunks)
    } catch {
      return Buffer.alloc(0)
    }
  }
}

/**
 * Native HTTP server normal context
 * @category none
 */
export class NativeHttpServerNormalContext
  extends NativeHttpServerBaseContext
  implements HttpServerContext
{
  constructor(
    req: http.IncomingMessage,
    protected readonly res: http.ServerResponse,
    state: HttpServerContextState
  ) {
    super('normal', req, state)

    this.method.freeze()
    this.url.freeze()
    this.requestHeaders.freeze()

    this.res.on('finish', () => {
      this.finishTime = Date.now()
    })
  }

  override get requestStream(): Readable {
    return this.req
  }

  override get responseStream(): Writable {
    return this.res
  }

  override async loadRequest(bodySizeLimit: number): Promise<void> {
    const requestBody = await this.loadRequestBody(this.req, bodySizeLimit)

    this.requestBody.set(requestBody).freeze()
  }

  override sendHead() {
    if (this.status.isUnknown()) {
      throw new HttpServerError(`Server internal error`, {
        context: {
          reason: `Unknown response status`,
          status: this.status.get(),
        },
        code: 'INTERNAL_ERROR',
      })
    }

    this.responseHeaders.forEach((name, value) => {
      this.res.setHeader(name, value)
    })

    this.res.writeHead(this.status.get())

    this.status.freeze()
    this.responseHeaders.freeze()
  }

  override async sendResponse(): Promise<void> {
    this.sendHead()

    await this.sendResponseBody(this.res, this.responseBody.get())

    this.responseBody.freeze()
  }

  override close() {
    if (!this.isComplete) {
      this.res.end()
    }
  }

  override get isComplete(): boolean {
    return this.res.writableEnded
  }
}

/**
 * Native HTTP server websocket context
 * @category none
 */
export class NativeHttpServerWebSocketContext
  extends NativeHttpServerBaseContext
  implements HttpServerContext
{
  protected readonly duplexStream: Duplex

  constructor(
    protected readonly ws: WebSocket,
    req: http.IncomingMessage,
    state: HttpServerContextState
  ) {
    super('websocket', req, state)

    this.method.freeze()
    this.url.freeze()
    this.requestHeaders.freeze()
    this.status.set(101).freeze()
    this.responseHeaders.freeze()
    this.responseBody.freeze()

    this.duplexStream = createWebSocketStream(ws)

    this.duplexStream.on('finish', () => {
      this.finishTime = Date.now()
    })
  }

  override get requestStream(): Readable {
    return this.duplexStream
  }

  override get responseStream(): Writable {
    return this.duplexStream
  }

  override async loadRequest(bodySizeLimit: number): Promise<void> {
    const requestBody = await this.loadRequestBody(this.req, bodySizeLimit)

    this.requestBody.set(requestBody).freeze()
  }

  override sendHead() {
    throw new Error(`Not implemented for websocket context`)
  }

  override sendResponse(): Promise<void> {
    throw new Error(`Not implemented for websocket context`)
  }

  override close() {
    if (!this.isComplete) {
      this.ws.close()
    }
  }

  override get isComplete(): boolean {
    return this.ws.readyState === WebSocket.CLOSING || this.ws.readyState === WebSocket.CLOSED
  }
}

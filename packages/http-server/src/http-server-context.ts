import { HttpBody, HttpConnection } from '@famir/http-proto'
import {
  HttpBodyWrap,
  HttpHeadersWrap,
  HttpMethodWrap,
  HttpStatusWrap,
  HttpUrlWrap,
  UAParser,
  UAResult,
  isbot,
} from '@famir/http-tools'
import http from 'node:http'
import type { Duplex, Readable, Writable } from 'node:stream'
import WebSocket, { createWebSocketStream } from 'ws'
import { HttpServerError } from './http-server.error.js'

/**
 * Represents the shared state of an http-server context.
 *
 * This state is passed to all middleware and can be used to share data
 * across the request/connection lifecycle.
 */
export interface HttpServerContextState {
  [key: string]: unknown
  verbose: boolean
  errorPage: string
}

/**
 * Variants of http-server context type.
 */
export type HttpServerContextType = 'normal' | 'websocket'

/**
 * Represents the http-server context of a normal HTTP request or WebSocket connection.
 *
 * Contains all request/response data, utility methods, and lifecycle state.
 * This is the primary object passed to middleware functions.
 */
export interface HttpServerContext {
  /** Associated context type. */
  readonly type: HttpServerContextType

  /** Associated shared state. */
  readonly state: HttpServerContextState

  /** Names of middleware that have already been processed. */
  readonly trace: string[]

  /** Request method wrapper. */
  readonly method: HttpMethodWrap

  /** Request URL wrapper. */
  readonly url: HttpUrlWrap

  /** Request headers wrapper. */
  readonly requestHeaders: HttpHeadersWrap

  /** Request body wrapper. */
  readonly requestBody: HttpBodyWrap

  /** Response status wrapper. */
  readonly status: HttpStatusWrap

  /** Response headers wrapper. */
  readonly responseHeaders: HttpHeadersWrap

  /** Response body wrapper. */
  readonly responseBody: HttpBodyWrap

  /** Readable stream for the request body. */
  readonly requestStream: Readable

  /** Writable stream for the response body. */
  readonly responseStream: Writable

  /**
   * Loads the request body into memory.
   *
   * @param bodySizeLimit - The maximum body size in bytes.
   * @throws {@link HttpServerError} If the body exceeds the size limit.
   */
  loadRequest(bodySizeLimit: number): Promise<void>

  /**
   * Sends the response headers to the client.
   */
  sendHead(): void

  /**
   * Sends the complete response to the client.
   */
  sendResponse(): Promise<void>

  /**
   * Closes the client connection.
   */
  close(): void

  /** Whether processing has completed. */
  readonly isComplete: boolean

  /** Whether the client is identified as a bot. */
  readonly isBot: boolean

  /** Parsed User-Agent data. */
  readonly userAgent: UAResult

  /** Parsed client IP address. */
  readonly clientIp: string | undefined

  /** Parsed connection details. */
  readonly connection: HttpConnection

  /** Timestamp when processing started. */
  readonly startTime: number

  /** Timestamp when processing finished. */
  readonly finishTime: number

  /**
   * Dumps a serializable representation of a context for logging.
   *
   * @returns A plain object with context details.
   */
  dump(): object
}

/**
 * Abstract base class for all http-server contexts.
 *
 * All specific contexts implementations should extend this class to ensure
 * consistent behavior and reduce code duplication.
 *
 * @internal
 */
export abstract class HttpServerBaseContext implements HttpServerContext {
  readonly trace: string[] = []

  readonly method: HttpMethodWrap

  readonly url: HttpUrlWrap

  readonly requestHeaders: HttpHeadersWrap

  readonly requestBody: HttpBodyWrap

  readonly status: HttpStatusWrap

  readonly responseHeaders: HttpHeadersWrap

  readonly responseBody: HttpBodyWrap

  /**
   * Creates a new context instance.
   *
   * @param type - The variant of context type.
   * @param req - The server request object.
   * @param state - The context shared state.
   */
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
      throw HttpServerError.badRequest(
        `Bad request`,
        {
          reason: `Create context failed`,
        },
        error
      )
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

  dump(): object {
    return {
      type: this.type,
      trace: this.trace,
      method: this.method.get(),
      url: this.url.toRelative(),
      requestHeaders: this.requestHeaders.toObject(),
      requestBody: this.requestBody.length,
      status: this.status.get(),
      responseHeaders: this.responseHeaders.toObject(),
      responseBody: this.responseBody.length,
      isComplete: this.isComplete,
      isBot: this.isBot,
      totalTime: this.finishTime - this.startTime,
    }
  }

  /**
   * Loads the request body from a readable stream.
   *
   * @param requestStream - The readable stream to read from.
   * @param bodySizeLimit - The maximum body size in bytes.
   * @returns A promise that resolves to the loaded body buffer.
   * @throws {@link HttpServerError} If the body exceeds the size limit or an error occurs.
   */
  protected loadRequestBody(requestStream: Readable, bodySizeLimit: number): Promise<HttpBody> {
    return new Promise<HttpBody>((resolve, reject) => {
      const chunks: Buffer[] = []
      let requestBodySize = 0

      requestStream.on('data', (chunk: Buffer) => {
        if (requestBodySize + chunk.length > bodySizeLimit) {
          requestStream.destroy()

          reject(
            HttpServerError.contentTooLarge(`Content too large`, {
              reason: `Request body size limit exceeded`,
              bodySizeLimit,
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
          HttpServerError.badRequest(
            `Bad request`,
            {
              reason: `Load request body failed`,
            },
            error
          )
        )
      })
    })
  }

  /**
   * Sends the response body to the client.
   *
   * @param responseStream - The writable stream to write to.
   * @param responseBody - The body buffer to send.
   * @returns A promise that resolves when the body has been sent.
   * @throws {@link HttpServerError} If sending fails.
   */
  protected sendResponseBody(responseStream: Writable, responseBody: HttpBody): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      responseStream.end(responseBody, (error?: Error) => {
        if (error) {
          reject(
            HttpServerError.internalError(
              `Internal error`,
              {
                reason: `Send response body failed`,
              },
              error
            )
          )

          return
        }

        resolve()
      })
    })
  }

  /**
   * Concatenates buffer chunks into a single Buffer.
   */
  private parseRawBody(chunks: Buffer[]): HttpBody {
    try {
      return Buffer.concat(chunks)
    } catch {
      return Buffer.alloc(0)
    }
  }
}

/**
 * Represents the http-server context for a normal HTTP requests.
 *
 * Handles standard HTTP request/response lifecycle with full streaming support.
 */
export class HttpServerNormalContext extends HttpServerBaseContext {
  /**
   * Creates a new Normal context.
   *
   * @param req - The server request object.
   * @param res - The server response object.
   * @param state - The context shared state.
   */
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
      throw HttpServerError.internalError(`Internal error`, {
        reason: `Unknown response status`,
        status: this.status.get(),
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
 * Represents the http-server context for a WebSocket connections.
 *
 * Handles WebSocket connection lifecycle with duplex streaming support.
 */
export class HttpServerWebSocketContext extends HttpServerBaseContext {
  protected readonly duplexStream: Duplex

  /**
   * Creates a new WebSocket context.
   *
   * @param ws - The WebSocket connection.
   * @param req - The server request object.
   * @param state - The context shared state.
   */
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

import {
  HttpBody,
  HttpBodyWrap,
  HttpConnection,
  HttpHeadersWrap,
  HttpMethodWrap,
  HttpStatusWrap,
  HttpUrlWrap
} from '@famir/http-tools'
import { isbot } from 'isbot'
import http from 'node:http'
import { Readable, Writable } from 'node:stream'
import { HttpServerError } from './http-server.error.js'
import { HttpServerContext, HttpServerContextState } from './http-server.js'

export class NativeHttpServerContext implements HttpServerContext {
  readonly state: HttpServerContextState = {}
  readonly middlewares: string[] = []

  constructor(
    protected readonly req: http.IncomingMessage,
    protected readonly res: http.ServerResponse,
    public readonly verbose: boolean,
    public readonly errorPage: string
  ) {
    this.res.on('finish', () => {
      this.#finishTime = Date.now()
    })

    try {
      this.method = HttpMethodWrap.fromReq(req)
      this.url = HttpUrlWrap.fromReq(req).freeze()
      this.requestHeaders = HttpHeadersWrap.fromReq(req).freeze()
      this.requestBody = HttpBodyWrap.fromScratch()
      this.status = HttpStatusWrap.fromScratch()
      this.responseHeaders = HttpHeadersWrap.fromScratch()
      this.responseBody = HttpBodyWrap.fromScratch()
    } catch (error) {
      throw new HttpServerError(`Bad request`, {
        cause: error,
        context: {
          reason: `Context constructor failed`
        },
        code: 'BAD_REQUEST'
      })
    }
  }

  get requestStream(): Readable {
    return this.req
  }

  get responseStream(): Writable {
    return this.res
  }

  readonly method: HttpMethodWrap
  readonly url: HttpUrlWrap
  readonly requestHeaders: HttpHeadersWrap
  readonly requestBody: HttpBodyWrap
  readonly status: HttpStatusWrap
  readonly responseHeaders: HttpHeadersWrap
  readonly responseBody: HttpBodyWrap

  async loadRequest(requestSizeLimit: number): Promise<void> {
    if (!(requestSizeLimit > 0)) {
      throw new TypeError(`Wrong loadRequest params`)
    }

    const requestBody = await this.loadRequestBody(requestSizeLimit)

    this.requestBody.set(requestBody).freeze()
  }

  sendHead() {
    if (this.status.isUnknown()) {
      throw new HttpServerError(`Server internal error`, {
        context: {
          reason: `Unknown response status`,
          status: this.status.get()
        },
        code: 'INTERNAL_ERROR'
      })
    }

    this.responseHeaders.forEach((name, value) => {
      this.res.setHeader(name, value)
    })

    this.res.writeHead(this.status.get())

    this.status.freeze()
    this.responseHeaders.freeze()
  }

  async sendResponse(): Promise<void> {
    this.sendHead()

    await this.sendResponseBody(this.responseBody.get())

    this.responseBody.freeze()
  }

  #isBot: boolean | null = null

  get isBot(): boolean {
    if (this.#isBot != null) {
      return this.#isBot
    }

    const value = this.requestHeaders.getString('User-Agent') ?? ''

    this.#isBot = isbot(value)

    return this.#isBot
  }

  get ip(): string {
    return this.requestHeaders.getString('X-Real-Ip') ?? this.req.socket.remoteAddress ?? ''
  }

  get connection(): HttpConnection {
    return {
      server_forwarded_for: this.requestHeaders.getString('X-Forwarded-For') ?? null,
      server_forwarded_host: this.requestHeaders.getString('X-Forwarded-Host') ?? null,
      server_forwarded_proto: this.requestHeaders.getString('X-Forwarded-Proto') ?? null
    }
  }

  readonly startTime: number = Date.now()

  #finishTime: number = 0

  get finishTime(): number {
    return this.#finishTime
  }

  get isComplete(): boolean {
    return this.res.writableEnded
  }

  private loadRequestBody(requestSizeLimit: number): Promise<HttpBody> {
    return new Promise<HttpBody>((resolve, reject) => {
      const chunks: Buffer[] = []
      let requestBodySize = 0

      this.req.on('data', (chunk: Buffer) => {
        requestBodySize += chunk.length

        if (requestBodySize > requestSizeLimit) {
          this.req.destroy()

          reject(
            new HttpServerError(`Content too large`, {
              context: {
                reason: `Request body size limit exceeded`,
                requestBodySize,
                requestSizeLimit
              },
              code: 'CONTENT_TOO_LARGE'
            })
          )
        } else {
          chunks.push(chunk)
        }
      })

      this.req.on('end', () => {
        const body = this.parseRawBody(chunks, requestBodySize)

        resolve(body)
      })

      this.req.on('error', (error) => {
        reject(
          new HttpServerError(`Bad request`, {
            cause: error,
            context: {
              reason: `Load request body failed`
            },
            code: 'BAD_REQUEST'
          })
        )
      })

      this.req.on('close', () => {
        if (!this.req.complete) {
          reject(
            new HttpServerError(`Bad request`, {
              context: {
                reason: `Request closed before complete`
              },
              code: 'BAD_REQUEST'
            })
          )
        }
      })
    })
  }

  private sendResponseBody(body: HttpBody): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.res.end(body, (error?: Error) => {
        if (error) {
          reject(
            new HttpServerError(`Server internal error`, {
              cause: error,
              context: {
                reason: `Send response body failed`
              },
              code: 'INTERNAL_ERROR'
            })
          )
        } else {
          resolve()
        }
      })
    })
  }

  protected parseRawBody(chunks: Buffer[], size: number): HttpBody {
    try {
      return Buffer.concat(chunks, size)
    } catch {
      return Buffer.alloc(0)
    }
  }
}

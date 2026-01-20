import {
  HttpBody,
  HttpHeaders,
  HttpMethod,
  HttpServerContext,
  HttpServerError,
  HttpState,
  HttpUrl,
  HttpUrlQuery
} from '@famir/domain'
import { getMethod, parseUrl, parseUrlQuery, getClientIp } from '@famir/http-tools'
import http from 'node:http'

export class NodeHttpServerContext implements HttpServerContext {
  constructor(
    protected readonly req: http.IncomingMessage,
    protected readonly res: http.ServerResponse
  ) {}

  readonly state: HttpState = {}

  readonly middlewares: string[] = []

  #method: HttpMethod | null = null

  get method(): HttpMethod {
    this.#method ??= getMethod(this.req.method)

    return this.#method
  }

  get originUrl(): string {
    return this.req.url ?? '/'
  }

  #url: HttpUrl | null = null

  get url(): Readonly<HttpUrl> {
    this.#url ??= parseUrl(this.originUrl)

    return this.#url
  }

  #urlQuery: HttpUrlQuery | null = null

  get urlQuery(): Readonly<HttpUrlQuery> {
    this.#urlQuery ??= parseUrlQuery(this.url)

    return this.#urlQuery
  }

  get requestHeaders(): Readonly<HttpHeaders> {
    return this.req.headers
  }

  loadRequestBody(bodyLimit: number): Promise<HttpBody> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      let totalLength = 0

      this.req.on('data', (chunk: Buffer) => {
        totalLength += chunk.length

        if (totalLength > bodyLimit) {
          this.req.destroy()

          reject(
            new HttpServerError(`Content too large`, {
              code: 'CONTENT_TOO_LARGE'
            })
          )
        } else {
          chunks.push(chunk)
        }
      })

      this.req.on('end', () => {
        try {
          resolve(Buffer.concat(chunks, totalLength))
        } catch (error) {
          reject(
            new HttpServerError(`Parse request body failed`, {
              cause: error,
              code: 'BAD_REQUEST'
            })
          )
        }
      })

      this.req.on('error', (error: Error) => {
        reject(
          new HttpServerError(`Load request body failed`, {
            cause: error,
            code: 'BAD_REQUEST'
          })
        )
      })

      this.req.on('close', () => {
        if (!this.req.complete) {
          reject(
            new HttpServerError(`Request closed before complete`, {
              code: 'BAD_REQUEST'
            })
          )
        }
      })
    })
  }

  readonly responseHeaders: HttpHeaders = {}

  sendResponseBody(status: number, body: HttpBody = Buffer.alloc(0)): Promise<void> {
    return new Promise((resolve, reject) => {
      this.res.writeHead(status, this.responseHeaders)

      this.res.end(body, (error?: Error) => {
        this.#finishTime = Date.now()

        if (error) {
          reject(
            new HttpServerError(`Send response failed`, {
              cause: error,
              code: 'INTERNAL_ERROR'
            })
          )
        } else {
          resolve()
        }
      })
    })
  }

  get status(): number {
    return this.res.statusCode
  }

  #clientIp: string[] | null = null

  get clientIp(): string[] {
    this.#clientIp ??= getClientIp(this.requestHeaders)

    return this.#clientIp
  }

  readonly startTime: number = Date.now()

  #finishTime: number = 0

  get finishTime(): number {
    return this.#finishTime
  }

  get isComplete(): boolean {
    return this.res.writableEnded
  }
}

import { serializeError } from '@famir/common'
import {
  HttpBody,
  HttpHeaders,
  HttpLogs,
  HttpRequestCookies,
  HttpResponseCookies,
  HttpServerContext,
  HttpServerError,
  HttpServerState,
  HttpServerUrl,
  HttpStrictHeaders,
  HttpStrictRequestCookies,
  HttpStrictResponseCookies
} from '@famir/domain'
import http from 'node:http'
import { URL } from 'node:url'
import qs from 'qs'

export class NodeHttpServerContext implements HttpServerContext {
  readonly state: HttpServerState = {}
  readonly logs: HttpLogs = []

  constructor(
    protected readonly req: http.IncomingMessage,
    protected readonly res: http.ServerResponse
  ) {}

  #method: string | null = null

  get method(): string {
    if (this.#method) {
      return this.#method
    }

    this.#method = this.buildMethod(this.req.method)

    return this.#method
  }

  private buildMethod(method: string | undefined): string {
    return method ? method.toUpperCase() : 'GET'
  }

  isMethod(method: string): boolean {
    return method.toUpperCase() === this.method
  }

  isMethods(methods: string[]): boolean {
    return methods.some((method) => this.isMethod(method))
  }

  #url: HttpServerUrl | null = null

  get url(): HttpServerUrl {
    if (this.#url) {
      return this.#url
    }

    this.#url = this.buildUrl(this.req.url)

    return this.#url
  }

  private buildUrl(url: string | undefined): HttpServerUrl {
    try {
      const parsedUrl = new URL(url ?? '/', 'http://localhost')

      return {
        path: parsedUrl.pathname,
        query: parsedUrl.search,
        hash: parsedUrl.hash
      }
    } catch (error) {
      this.logs.push([
        'parse-url-error',
        {
          url,
          error: serializeError(error)
        }
      ])

      return {
        path: '/',
        query: '',
        hash: ''
      }
    }
  }

  isUrlPath(path: string): boolean {
    return this.url.path === path
  }

  parseUrlQuery(): Record<string, unknown> {
    const query = this.url.query

    try {
      return qs.parse(query, {
        ignoreQueryPrefix: true
      })
    } catch (error) {
      this.logs.push([
        'parse-url-query-error',
        {
          query,
          error: serializeError(error)
        }
      ])

      return {}
    }
  }

  isStreaming: boolean = false

  #requestHeaders: HttpHeaders | null = null

  get requestHeaders(): HttpHeaders {
    if (this.#requestHeaders) {
      return this.#requestHeaders
    }

    this.#requestHeaders = this.buildRequestHeaders(this.req.headers)

    return this.#requestHeaders
  }

  private buildRequestHeaders(headers: Record<string, string | string[] | undefined>): HttpHeaders {
    return { ...headers } // TODO
  }

  strictRequestHeaders(): Readonly<HttpStrictHeaders> {
    const headers: HttpStrictHeaders = {}

    Object.entries(this.requestHeaders).forEach(([name, value]) => {
      if (value != null) {
        headers[name] = value
      }
    })

    return headers
  }

  #requestCookies: HttpRequestCookies | null = null

  get requestCookies(): HttpRequestCookies {
    if (this.#requestCookies) {
      return this.#requestCookies
    }

    this.#requestCookies = this.buildRequestCookies(this.req.headers['cookie'])

    return this.#requestCookies
  }

  private buildRequestCookies(cookieHeader: string | undefined): HttpRequestCookies {
    try {
      return {} // TODO
    } catch (error) {
      this.logs.push([
        'parse-request-cookies-error',
        {
          cookieHeader,
          error: serializeError(error)
        }
      ])

      return {}
    }
  }

  strictRequestCookies(): Readonly<HttpStrictRequestCookies> {
    const cookies: HttpStrictRequestCookies = {}

    Object.entries(this.requestCookies).forEach(([name, value]) => {
      if (value != null) {
        cookies[name] = value
      }
    })

    return cookies
  }

  // FIXME
  updateRequestCookieHeader() {
    const cookies = this.strictRequestCookies()

    const cookieHeader = '' // TODO

    this.requestHeaders['cookie'] = cookieHeader
  }

  requestBody: HttpBody = Buffer.alloc(0)

  loadRequestBody(limit: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const chunks: Buffer[] = []

      let totalLength = 0

      this.req.on('data', (chunk: Buffer) => {
        totalLength += chunk.length

        if (totalLength > limit) {
          this.req.destroy()

          reject(
            new HttpServerError(`Request entity too large`, {
              code: 'CONTENT_TOO_LARGE'
            })
          )

          return
        }

        chunks.push(chunk)
      })

      this.req.on('end', () => {
        try {
          this.requestBody = Buffer.concat(chunks, totalLength)

          resolve()
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
          new HttpServerError(`Load request body error`, {
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

  strictResponseHeaders(): Readonly<HttpStrictHeaders> {
    const headers: HttpStrictHeaders = {}

    Object.entries(this.responseHeaders).forEach(([name, value]) => {
      if (value != null) {
        headers[name] = value
      }
    })

    return headers
  }

  get responseHeadersSent(): boolean {
    return this.res.headersSent
  }

  readonly responseCookies: HttpResponseCookies = {}

  parseResponseCookies() {
    const setCookieHeader = this.responseHeaders['set-cookie'] || []

    try {
      // TODO
    } catch (error) {
      this.logs.push([
        'parse-response-cookies-error',
        {
          setCookieHeader,
          error: serializeError(error)
        }
      ])
    }
  }

  strictResponseCookies(): Readonly<HttpStrictResponseCookies> {
    const cookies: HttpStrictResponseCookies = {}

    Object.entries(this.responseCookies).forEach(([name, value]) => {
      if (value != null) {
        cookies[name] = value
      }
    })

    return cookies
  }

  updateResponseSetCookieHeader() {
    const cookies = this.strictResponseCookies()

    const setCookieHeader = [''] // TODO

    this.responseHeaders['set-cookie'] = setCookieHeader
  }

  responseBody: HttpBody = Buffer.alloc(0)

  sendResponse(status: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.#status = status

      this.res.writeHead(this.#status, this.strictResponseHeaders())

      this.res.end(this.responseBody, (error?: Error) => {
        if (error) {
          reject(
            new HttpServerError(`Response send failed`, {
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

  #clientIp: string | null = null

  get clientIp(): string {
    if (this.#clientIp) {
      return this.#clientIp
    }

    //const forwardedForHeader = this.req.headers('x-forwarded-for') ?? ''

    this.#clientIp = ''

    return this.#clientIp
  }

  #status: number = 0

  get status(): number {
    return this.#status
  }

  #score: number = 0

  get score(): number {
    return this.#score
  }

  upScore(score: number) {
    if (this.#score < score) {
      this.#score = score
    }
  }

  startTime: number = Date.now()
  finishTime = 0
}

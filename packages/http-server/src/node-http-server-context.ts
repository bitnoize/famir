import { serializeError } from '@famir/common'
import {
  HttpBody,
  HttpHeader,
  HttpHeaders,
  HttpRequestCookie,
  HttpRequestCookies,
  HttpResponseCookie,
  HttpResponseCookies,
  HttpServerContext,
  HttpServerContextErrors,
  HttpServerContextState,
  HttpServerError
} from '@famir/domain'
import http from 'node:http'
import { URL } from 'node:url'

export class NodeHttpServerContext implements HttpServerContext {
  protected readonly errors: HttpServerContextErrors = []

  readonly state: HttpServerContextState = {}

  readonly #method: string
  readonly #originUrl: string

  constructor(
    protected readonly req: http.IncomingMessage,
    protected readonly res: http.ServerResponse
  ) {
    const { method, url } = this.req

    this.#method = method ? method.toUpperCase() : 'GET'
    this.#originUrl = url && url.startsWith('/') ? url : '/'
  }

  get method(): string {
    return this.#method
  }

  isMethod(method: string): boolean {
    return method.toUpperCase() === this.#method
  }

  isMethods(methods: string[]): boolean {
    return methods.map((method) => method.toUpperCase()).includes(this.#method)
  }

  get originUrl(): string {
    return this.#originUrl
  }

  urlPath: string = '/'
  urlQuery: string = ''
  urlHash: string = ''

  parseUrl() {
    try {
      const parsedUrl = new URL(this.#originUrl, 'http://localhost')

      this.urlPath = parsedUrl.pathname
      this.urlQuery = parsedUrl.search
      this.urlHash = parsedUrl.hash
    } catch (error) {
      this.errors.push(serializeError(error))
    }
  }

  isStreaming: boolean = false

  get originRequestHeaders(): Record<string, HttpHeader | undefined> {
    return this.req.headers
  }

  readonly requestHeaders: HttpHeaders = {}

  /*
  parseRequestHeaders() {
    Object.entries(this.req.headers).forEach(([name, value]) => {
      this.#requestHeaders[name] = value
    })

    // obsolete headers..
  }
  */

  strictRequestHeaders(): Record<string, HttpHeader> {
    const headers: Record<string, HttpHeader> = {}

    Object.entries(this.requestHeaders).forEach(([name, value]) => {
      if (value != null) {
        headers[name] = value
      }
    })

    return headers
  }

  setResponseHeaders(headers: Record<string, HttpHeader>) {
    Object.entries(headers).forEach(([name, value]) => {
      name = name.toLowerCase()

      this.responseHeaders[name] = value
    })
  }

  readonly requestCookies: HttpRequestCookies = {}

  parseRequestCookies() {
    try {
      const cookieHeader = this.requestHeaders['cookie'] || ''

      // TODO
    } catch (error) {
      this.errors.push(serializeError(error))
    }
  }

  strictRequestCookies(): Record<string, HttpRequestCookie> {
    const cookies: Record<string, HttpRequestCookie> = {}

    Object.entries(this.requestCookies).forEach(([name, value]) => {
      if (value != null) {
        cookies[name] = value
      }
    })

    return cookies
  }

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

  #status: number = 0

  get status(): number {
    return this.#status
  }

  readonly responseHeaders: HttpHeaders = {}

  /*
  parseResponseHeaders(headers: Record<string, string | string[] | undefined>) {
    Object.entries(headers).forEach(([name, value]) => {
      this.#responseHeaders[name] = value
    })

    // obsolete headers..
  }
  */

  strictResponseHeaders(): Record<string, HttpHeader> {
    const headers: Record<string, HttpHeader> = {}

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
    try {
      const setCookieHeader = this.responseHeaders['set-cookie'] || []

      // TODO
    } catch (error) {
      this.errors.push(serializeError(error))
    }
  }

  strictResponseCookies(): Record<string, HttpResponseCookie> {
    const cookies: Record<string, HttpResponseCookie> = {}

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

  get isComplete(): boolean {
    return this.req.complete
  }
}

/*
  getRequestHeader(name: string): string | undefined {
    name = name.toLowerCase()

    const value = this.#requestHeaders[name]

    if (value == null) {
      return undefined
    }

    if (Array.isArray(value)) {
      return value[0] != null ? value[0] : undefined
    }

    return value
  }

  getRequestHeaderArray(name: string): string[] | undefined {
    name = name.toLowerCase()

    const value = this.#requestHeaders[name]

    if (value == null) {
      return undefined
    }

    if (typeof value === 'string') {
      return [value]
    }

    return value
  }

  setRequestHeader(name: string, value: HttpHeader) {
    name = name.toLowerCase()

    this.#requestHeaders[name] = value
  }

  setRequestHeaders(headers: Record<string, HttpHeader>) {
    Object.entries(headers).forEach(([name, value]) => {
      this.setRequestHeader(name, value)
    })
  }

  delRequestHeader(name: string, prune = false) {
    name = name.toLowerCase()

    this.#requestHeaders[name] = prune ? undefined : null
  }

  delRequestHeaders(names: string[], prune = false) {
    names.forEach((name) => {
      this.delRequestHeader(name, prune)
    })
  }
  */

/*
  getRequestCookie(name: string): HttpRequestCookie | undefined {
    const value = this.#requestCookies[name]

    return value != null ? value : undefined
  }

  setRequestCookie(name: string, value: HttpRequestCookie) {
    this.#requestCookies[name] = value
  }

  setRequestCookies(cookies: Record<string, HttpRequestCookie>) {
    Object.entries(cookies).forEach(([name, value]) => {
      this.setRequestCookie(name, value)
    })
  }

  delRequestCookie(name: string, prune = false) {
    this.#requestCookies[name] = prune ? undefined : null
  }

  delRequestCookies(names: string[], prune = false) {
    names.forEach((name) => {
      this.delRequestCookie(name, prune)
    })
  }
  */

/*
  getResponseHeader(name: string): string | undefined {
    name = name.toLowerCase()

    const value = this.#responseHeaders[name]

    if (value == null) {
      return undefined
    }

    if (Array.isArray(value)) {
      return value[0] != null ? value[0] : undefined
    }

    return value
  }

  getResponseHeaderArray(name: string): string[] | undefined {
    name = name.toLowerCase()

    const value = this.#responseHeaders[name]

    if (value == null) {
      return undefined
    }

    if (typeof value === 'string') {
      return [value]
    }

    return value
  }

  setResponseHeader(name: string, value: HttpHeader) {
    name = name.toLowerCase()

    this.#responseHeaders[name] = value
  }

  setResponseHeaders(headers: Record<string, HttpHeader>) {
    Object.entries(headers).forEach(([name, value]) => {
      this.setResponseHeader(name, value)
    })
  }

  delResponseHeader(name: string, prune = false) {
    name = name.toLowerCase()

    this.#responseHeaders[name] = prune ? undefined : null
  }

  delResponseHeaders(names: string[], prune = false) {
    names.forEach((name) => {
      this.delResponseHeader(name, prune)
    })
  }
  */

/*
  getResponseCookie(name: string): HttpResponseCookie | undefined {
    const value = this.#responseCookies[name]

    return value != null ? value : undefined
  }

  setResponseCookie(name: string, value: HttpResponseCookie) {
    this.#responseCookies[name] = value
  }

  setResponseCookies(cookies: Record<string, HttpResponseCookie>) {
    Object.entries(cookies).forEach(([name, value]) => {
      this.setResponseCookie(name, value)
    })
  }

  delResponseCookie(name: string, prune = false) {
    this.#responseCookies[name] = prune ? undefined : null
  }

  delResponseCookies(names: string[], prune = false) {
    names.forEach((name) => {
      this.delResponseCookie(name, prune)
    })
  }
  */

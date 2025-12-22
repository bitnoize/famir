import {
  HttpBody,
  HttpConnection,
  HttpHeader,
  HttpHeaders,
  HttpMediaType,
  HttpQueryString,
  HttpRelativeUrl,
  HttpRequestCookies,
  HttpResponseCookies,
  HttpServerContext,
  HttpServerError,
  HttpState
} from '@famir/domain'
import contentType from 'content-type'
import { isbot } from 'isbot'
import http from 'node:http'
import { URL } from 'node:url'
import qs from 'qs'
import { Cookie } from 'tough-cookie'
import { FormatQueryStringOptions, ParseQueryStringOptions } from './http-server.js'

export class NodeHttpServerContext implements HttpServerContext {
  constructor(
    protected readonly req: http.IncomingMessage,
    protected readonly res: http.ServerResponse
  ) {
    this.url = this.parseRelativeUrl(this.originUrl)
  }

  readonly state: HttpState = {}

  get method(): string {
    return this.req.method ?? 'GET'
  }

  isMethod(value: string): boolean {
    return value.toUpperCase() === this.method
  }

  isMethods(values: string[]): boolean {
    return values.some((value) => this.isMethod(value))
  }

  get originUrl(): string {
    return this.req.url ?? '/'
  }

  readonly url: HttpRelativeUrl

  normalizeUrl(): string {
    return this.formatRelativeUrl(this.url)
  }

  isUrlPathEquals(value: string): boolean {
    return value === this.url.path
  }

  isUrlPathUnder(value: string): boolean {
    return this.url.path.startsWith(value)
  }

  isUrlPathMatch(value: RegExp): boolean {
    return value.test(this.url.path)
  }

  getUrlQuery(options: ParseQueryStringOptions = {}): HttpQueryString {
    options.ignoreQueryPrefix = true

    return this.parseQueryString(this.url.search, options)
  }

  setUrlQuery(query: HttpQueryString, options: FormatQueryStringOptions = {}) {
    options.addQueryPrefix = true

    const search = this.formatQueryString(query, options)

    this.url.search = search
  }

  isStreaming: boolean = false

  get requestHeaders(): HttpHeaders {
    return this.req.headers
  }

  getRequestHeader(name: string): string | undefined {
    return this.getHeader(this.requestHeaders, name)
  }

  getRequestHeaderArray(name: string): string[] | undefined {
    return this.getHeaderArray(this.requestHeaders, name)
  }

  setRequestHeader(name: string, value: HttpHeader | undefined) {
    this.setHeader(this.requestHeaders, name, value)
  }

  setRequestHeaders(headers: HttpHeaders) {
    this.setHeaders(this.requestHeaders, headers)
  }

  getRequestMediaType(): HttpMediaType {
    return this.getMediaType(this.requestHeaders)
  }

  setRequestMediaType(mediaType: HttpMediaType) {
    this.setMediaType(this.requestHeaders, mediaType)
  }

  getRequestCookies(): HttpRequestCookies {
    const header = this.getRequestHeaderArray('Cookie') ?? []

    return this.parseRequestCookies(header)
  }

  setRequestCookies(cookies: HttpRequestCookies) {
    const header = this.formatRequestCookies(cookies)

    this.setRequestHeader('Cookie', header)
  }

  getClientIp(): string | null {
    const header = this.getRequestHeaderArray('X-Forwarded-For') ?? []

    return this.parseClientIp(header)
  }

  #requestBody: HttpBody = Buffer.alloc(0)

  get requestBody(): HttpBody {
    return this.#requestBody
  }

  loadRequestBody(bodyLimit: number): Promise<void> {
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

          return
        }

        chunks.push(chunk)
      })

      this.req.on('end', () => {
        try {
          this.#requestBody = Buffer.concat(chunks, totalLength)

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

  applyRequestWrappers() {
    // ...
  }

  readonly responseHeaders: HttpHeaders = {}

  getResponseHeader(name: string): string | undefined {
    return this.getHeader(this.responseHeaders, name)
  }

  getResponseHeaderArray(name: string): string[] | undefined {
    return this.getHeaderArray(this.responseHeaders, name)
  }

  setResponseHeader(name: string, value: HttpHeader | undefined) {
    this.setHeader(this.responseHeaders, name, value)
  }

  setResponseHeaders(headers: HttpHeaders) {
    this.setHeaders(this.responseHeaders, headers)
  }

  getResponseMediaType(): HttpMediaType {
    return this.getMediaType(this.responseHeaders)
  }

  setResponseMediaType(mediaType: HttpMediaType) {
    this.setMediaType(this.responseHeaders, mediaType)
  }

  getResponseCookies(): HttpResponseCookies {
    const header = this.getResponseHeaderArray('Cookie') ?? []

    return this.parseResponseCookies(header)
  }

  setResponseCookies(cookies: HttpResponseCookies) {
    const header = this.formatResponseCookies(cookies)

    this.setResponseHeader('Cookie', header)
  }

  #responseBody: HttpBody = Buffer.alloc(0)

  get responseBody(): HttpBody {
    return this.#responseBody
  }

  setResponseBody(body: HttpBody) {
    this.#responseBody = body
  }

  /*
  prepareResponse(
    status: number,
    headers?: HttpHeaders,
    body?: HttpBody,
    connection?: HttpConnection
  ) {
    this.#status = status

    if (headers) {
      this.setResponseHeaders(headers)
    }

    if (body) {
      this.#responseBody = body
    }

    if (connection) {
      this.#connection = connection
    }
  }
  */

  applyResponseWrappers() {}

  protected sendResponseHeaders() {
    Object.entries(this.responseHeaders).forEach(([name, value]) => {
      if (value != null) {
        this.res.setHeader(name, value)
      }
    })
  }

  sendResponse(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sendResponseHeaders()

      this.res.writeHead(this.status)

      this.res.end(this.responseBody, (error?: Error) => {
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

  #status: number = 0

  get status(): number {
    return this.#status
  }

  setStatus(status: number) {
    this.#status = status
  }

  protected testStatusRange(min: number, max: number): boolean {
    return this.status >= min && this.status < max
  }

  get isStatusInformation(): boolean {
    return this.testStatusRange(100, 200)
  }

  get isStatusSuccess(): boolean {
    return this.testStatusRange(200, 300)
  }

  get isStatusRedirect(): boolean {
    return this.testStatusRange(300, 400)
  }

  get isStatusClientError(): boolean {
    return this.testStatusRange(400, 500)
  }

  get isStatusServerError(): boolean {
    return this.testStatusRange(500, 600)
  }

  get isStatusUnknown(): boolean {
    return !this.testStatusRange(100, 600)
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

  readonly startTime: number = Date.now()

  #finishTime: number = 0

  get finishTime(): number {
    return this.#finishTime
  }

  #connection: HttpConnection = {}

  get connection(): HttpConnection {
    return this.#connection
  }

  setConnection(connection: HttpConnection) {
    this.#connection = connection
  }

  /*
  dumpMessage(): HttpServerMessage {
    return {
      method: this.method,
      url: ctx.normalizeUrl(),
      isStreaming: this.isStreaming,
      requestHeaders: this.requestHeaders,
      requestBody: this.requestBody,
      responseHeaders: this.responseHeaders,
      responseBody: this.responseBody,
      clientIp: this.clientIp,
      status: this.status,
      score: this.score,
      startTime: this.startTime,
      finishTime: this.finishTime,
      connection: this.connection
    }
  }
  */

  get isComplete(): boolean {
    return this.#finishTime > 0
  }

  isBot(): boolean {
    const value = this.getRequestHeader('User-Agent')

    return isbot(value)
  }

  //
  // Helpers
  //

  protected getHeader(source: HttpHeaders, name: string): string | undefined {
    name = name.toLowerCase()

    const value = source[name]

    if (value == null) {
      return undefined
    }

    if (Array.isArray(value)) {
      return value[0] != null ? value[0] : undefined
    }

    return value
  }

  protected getHeaderArray(source: HttpHeaders, name: string): string[] | undefined {
    name = name.toLowerCase()

    const value = source[name]

    if (value == null) {
      return undefined
    }

    if (typeof value === 'string') {
      return [value]
    }

    return value
  }

  protected setHeader(source: HttpHeaders, name: string, value: HttpHeader | undefined) {
    name = name.toLowerCase()

    source[name] = value
  }

  protected setHeaders(source: HttpHeaders, headers: HttpHeaders) {
    Object.entries(headers).forEach(([name, value]) => {
      this.setHeader(source, name, value)
    })
  }

  protected getMediaType(source: HttpHeaders): HttpMediaType {
    const value = this.getHeader(source, 'Content-Type') ?? ''

    return this.parseMediaType(value)
  }

  protected setMediaType(source: HttpHeaders, mediaType: HttpMediaType) {
    const value = this.formatMediaType(mediaType)

    this.setHeader(source, 'Content-Type', value)
  }

  //
  // RelativeUrl helpers
  //

  private parseRelativeUrl(value: string): HttpRelativeUrl {
    const parsedUrl = URL.parse(value, 'http://localhost')

    if (!parsedUrl) {
      return {
        path: '/',
        search: '',
        hash: ''
      }
    }

    return {
      path: parsedUrl.pathname,
      search: parsedUrl.search,
      hash: parsedUrl.hash
    }
  }

  private formatRelativeUrl(url: HttpRelativeUrl): string {
    return [url.path, url.search, url.hash].join('')
  }

  //
  // QueryString helpers
  //

  private parseQueryString(value: string, options: ParseQueryStringOptions): HttpQueryString {
    return qs.parse(value, options)
  }

  private formatQueryString(query: HttpQueryString, options: FormatQueryStringOptions): string {
    return qs.stringify(query, options)
  }

  //
  // RequestCookies helpers
  //

  private parseRequestCookies(header: string[]): HttpRequestCookies {
    const cookies: HttpRequestCookies = {}

    header
      .join(';')
      .split(';')
      .forEach((rawCookie) => {
        const toughCookie = Cookie.parse(rawCookie, {
          //loose: true
        })

        if (toughCookie) {
          cookies[toughCookie.key] = toughCookie.value
        }
      })

    return cookies
  }

  private formatRequestCookies(cookies: HttpRequestCookies): string {
    const toughCookies: Cookie[] = []

    Object.entries(cookies).forEach(([name, value]) => {
      if (value != null) {
        const toughCookie = new Cookie({
          key: name,
          value: value
        })

        toughCookies.push(toughCookie)
      }
    })

    return toughCookies.map((toughCookie) => toughCookie.cookieString()).join(';')
  }

  //
  // ResponseCookies helpers
  //

  private parseResponseCookies(header: string[]): HttpResponseCookies {
    const cookies: HttpResponseCookies = {}

    header
      .join(';')
      .split(';')
      .forEach((rawCookie) => {
        const toughCookie = Cookie.parse(rawCookie, {
          //loose: true
        })

        if (!toughCookie) {
          return
        }

        const name = toughCookie.key

        cookies[name] = {
          value: toughCookie.value
        }

        // tough-cookie expires: Date | 'Infinity' | null
        if (toughCookie.expires instanceof Date) {
          cookies[name].expires = toughCookie.expires.getTime()
        }

        // tough-cookie maxAge: number | 'Infinity' | '-Infinity' | null
        if (typeof toughCookie.maxAge === 'number') {
          cookies[name].maxAge = toughCookie.maxAge
        }

        if (toughCookie.path != null) {
          cookies[name].path = toughCookie.path
        }

        if (toughCookie.domain != null) {
          cookies[name].domain = toughCookie.domain
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (toughCookie.secure != null) {
          cookies[name].secure = toughCookie.secure
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (toughCookie.httpOnly != null) {
          cookies[name].httpOnly = toughCookie.httpOnly
        }

        if (toughCookie.sameSite != null) {
          cookies[name].sameSite = toughCookie.sameSite
        }
      })

    return cookies
  }

  private formatResponseCookies(cookies: HttpResponseCookies): string {
    const toughCookies: Cookie[] = []

    Object.entries(cookies).forEach(([name, cookie]) => {
      if (cookie != null) {
        const toughCookie = new Cookie({
          key: name,
          value: cookie.value
        })

        if (cookie.expires != null) {
          toughCookie.expires = new Date(cookie.expires)
        }

        if (cookie.maxAge != null) {
          toughCookie.maxAge = cookie.maxAge
        }

        if (cookie.path != null) {
          toughCookie.path = cookie.path
        }

        if (cookie.domain != null) {
          toughCookie.domain = cookie.domain
        }

        if (cookie.secure != null) {
          toughCookie.secure = cookie.secure
        }

        if (cookie.httpOnly != null) {
          toughCookie.httpOnly = cookie.httpOnly
        }

        if (cookie.sameSite != null) {
          toughCookie.sameSite = cookie.sameSite
        }

        toughCookies.push(toughCookie)
      }
    })

    return toughCookies.map((toughCookie) => toughCookie.cookieString()).join(';')
  }

  //
  // MediaType Helpers
  //

  private parseMediaType(value: string): HttpMediaType {
    return contentType.parse(value)
  }

  private formatMediaType(mediaType: HttpMediaType): string {
    return contentType.format(mediaType)
  }

  //
  // ClientIp Helpers
  //

  private parseClientIp(values: string[]): string | null {
    const ips = values
      .join(',')
      .split(',')
      .map((ip) => ip.trim())
      .filter((ip) => ip)

    return ips[0] ? ips[0] : null
  }

  /*


  //
  // Html helpers
  //

  private parseHtml(
    body: HttpBody,
    charset = 'utf8',
    options: ParseHtmlOptions
  ): CheerioRoot | null {
    try {
      const value = body.toString(charset)

      return cheerio.load(value, options)
    } catch (error) {
      this.addLog('parse-html-error', {
        charset,
        options,
        error: serializeError(error)
      })

      return null
    }
  }

  private formatHtml($: CheerioRoot, charset = 'utf8'): HttpBody | null {
    try {
      return Buffer.from($.html(), charset)
    } catch (error) {
      this.addLog('format-html-error', {
        charset,
        error: serializeError(error)
      })

      return null
    }
  }

  //
  // Wrappers
  //

  protected readonly urlQueryWrappers: UrlQueryWrapper[] = []

  addUrlQueryWrapper(wrapper: HttpServerUrlQueryWrapper) {
    this.urlQueryWrappers.push(wrapper)
  }

  applyUrlQueryWrappers(
    parseOptions?: QueryStringParseOptions,
    formatOptions?: HttpUrlQueryFormatOptions
  ) {
    const hasWork = this.urlQueryWrappers.length > 0

    if (!hasWork) {
      return
    }

    const query = this.getUrlQuery(parseOptions)

    if (query == null) {
      return
    }

    for (const wrapper of this.urlQueryWrappers) {
      try {
        wrapper(query)
      } catch (error) {
        this.logs.push([
          'url-query-wrapper-error',
          {
            query,
            error: serializeError(error)
          }
        ])
      }
    }

    const value = this.formatUrlQuery(query, formatOptions)

    if (value != null) {
      this.url.search = value
    }
  }




  protected readonly requestHtmlWrappers: HttpServerHtmlWrapper[] = []

  addRequestHtmlWrapper(handler: HttpServerHtmlHandler, charset: string = 'utf8') {
    this.requestHtmlWrappers.push([handler, charset])
  }

  applyRequestHtmlWrappers(source: HttpBody, parseOptions?: object) {
    const hasWork = this.requestHtmlWrappers.length > 0

    if (!hasWork) {
      return
    }

    const $ = this.parseHtml(this.requestBody, charset, parseOptions)

    for (const wrapper of this.requestHtmlWrappers) {
      try {
        wrapper($)
      } catch (error) {
        this.addLog('request-html-wrapper-error', {
          error: serializeError(error)
        })
      }
    }

    this.requestBody = this.formatHtml($)
  }



  //
  //
  //

  private testMediaTypeValues(mediaType: HttpMediaType, values: string[]): boolean {
    return values.some((value) => value === mediaType.type)
  }

  private dispatchMediaTypes(
    source: HttpHeaders,
    mediaTable: HttpMediaTable
  ) {
    const mediaType = this.getMediaType(source)

    if (!mediaType) {
      return
    }

    let knownName: DispatchMediaName | undefined = undefined

    const mediaTypeValues = {
      Text: ['text/plain'],
      Html: ['text/html'],
      Javascript: ['application/javascript', 'text/javascript'],
      Stylesheet: ['text/css'],
      Json: ['application/json'],
      WwwFormUrlEncoded: ['application/x-www-form-urlencoded'],
      MultipartFormData: ['multipart/form-data']
    }

    const mediaName = Object.keys(mediaTypeValues).find((mediaName) => {
      const mediaTypeValues = mediaTypeValues[mediaName]

      return mediaTypeValues != null && testMediaTypeValues(mediaType, mediaTypeValues)
    })

    if (!mediaName) {
      return
    }

    const handler = table[mediaName]

    if (!handler) {
      return
    }

    handler(mediaType)
  }
  */
}

/*
export class NodeHttpServerContext implements HttpServerContext {
  readonly state: HttpServerState = {}
  readonly logs: HttpLogs = []

  constructor(
    protected readonly req: http.IncomingMessage,
    protected readonly res: http.ServerResponse
  ) {
    this.method = this.req.method ?? 'GET'
    this.#url = this.parseUrl(this.req.url ?? '')
    this.requestHeaders = { ...this.req.headers }
    this.requestCookies = this.parseRequestCookies(this.req.headers.cookie ?? '')
  }

  readonly method: string

  isMethod(value: string): boolean {
    return value.toUpperCase() === this.method
  }

  isMethods(values: string[]): boolean {
    return values.some((value) => this.isMethod(value))
  }

  readonly #url: HttpRelativeUrl

  get url(): string {
    return this.formatUrl(this.#url)
  }

  isUrlPathEquals(value: string): boolean {
    return value === this.#url.path
  }

  isUrlPathStartsWith(value: string): boolean {
    return this.#url.path.startsWith(value)
  }

  isUrlPathMatch(value: RegExp): boolean {
    return value.test(this.#url.path)
  }


  readonly requestHeaders: HttpHeaders

  readonly requestCookies: HttpRequestCookies = {}

  requestBody: HttpBody = Buffer.alloc(0)

  loadRequestBody(bodyLimit: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const chunks: Buffer[] = []

      let totalLength = 0

      this.req.on('data', (chunk: Buffer) => {
        totalLength += chunk.length

        if (totalLength > bodyLimit) {
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

  get responseHeadersSent(): boolean {
    return this.res.headersSent
  }

  readonly responseHeaders: HttpHeaders = {}

  readonly responseCookies: HttpResponseCookies = {}

  buildResponseCookies(values: string[] = []) {
    try {
      const setCookieHeader = this.responseHeaders['set-cookie'] || []

      const cookies = setCookieHeader.map(Cookie.parse)

      cookies.map((cookie) => {
        return {
          name: cookie.name,

        }
      })
    } catch (error) {
      this.logs.push([
        'parse-response-cookies-error',
        {
          //setCookieHeader,
          error: serializeError(error)
        }
      ])

      return {}
    }
  }

  renewResponseSetCookieHeader() {
    const cookies = this.copyResponseCookies()

    const setCookieHeader = [''] // TODO

    this.responseHeaders['set-cookie'] = setCookieHeader
  }

  responseBody: HttpBody = Buffer.alloc(0)

  sendRegularResponse(status: number): Promise<void> {
    return new Promise((resolve, reject) => {
      Object.entries(this.responseHeaders).forEach(([name, value]) => {
        if (testHttpHeader(value)) {
          this.res.setHeader(name, value)
        }
      })

      this.res.writeHead(status)

      this.res.end(this.responseBody, (error?: Error) => {
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

  #clientIp: string | null = null

  get clientIp(): string {
    if (this.#clientIp) {
      return this.#clientIp
    }

    const header = this.req.headers['x-real-ip']

    this.#clientIp = this.buildClientIp(header)

    return this.#clientIp

    return ''
  }

  //private buildClientIp(value: string | string[] | undefined): string {
  //}

  readonly startTime: number = Date.now()

  #finishTime: number = 0

  get finishTime(): number {
    return this.#finishTime
  }

}

*/

import {
  formatQueryString,
  HttpFormatQueryStringOptions,
  HttpParseQueryStringOptions,
  HttpQueryString,
  parseQueryString
} from './query-string.js'

export interface HttpUrl {
  protocol: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
}

export class HttpUrlWrap {
  static fromReq(req: { url?: string | undefined }): HttpUrlWrap {
    if (req.url == null) {
      throw new Error(`Url not defined`)
    }

    return HttpUrlWrap.fromRelative(req.url)
  }

  static fromRelative(value: string): HttpUrlWrap {
    const parsedUrl = URL.parse(value, 'http://localhost')

    if (!parsedUrl) {
      throw new Error(`Url parse error`)
    }

    return new HttpUrlWrap({
      protocol: 'http:',
      hostname: 'localhost',
      port: '80',
      pathname: parsedUrl.pathname,
      search: parsedUrl.search,
      hash: parsedUrl.hash
    })
  }

  static fromAbsolute(value: string): HttpUrlWrap {
    const parsedUrl = URL.parse(value)

    if (!parsedUrl) {
      throw new Error(`Url parse error`)
    }

    return new HttpUrlWrap({
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      pathname: parsedUrl.pathname,
      search: parsedUrl.search,
      hash: parsedUrl.hash
    })
  }

  #url: HttpUrl
  protected isFrozen: boolean = false

  constructor(url: HttpUrl) {
    this.#url = url
  }

  clone(): HttpUrlWrap {
    return new HttpUrlWrap({ ...this.#url })
  }

  freeze(): this {
    this.isFrozen ||= true

    return this
  }

  get<K extends keyof HttpUrl>(name: K): HttpUrl[K] {
    return this.#url[name]
  }

  set<K extends keyof HttpUrl>(name: K, value: HttpUrl[K]): this {
    this.sureNotFrozen('set')

    this.invalidateCacheFor(name)

    this.#url[name] = value

    return this
  }

  merge(url: Partial<HttpUrl>): this {
    this.sureNotFrozen('merge')

    Object.entries(url).forEach(([name, value]) => {
      this.set(name as keyof HttpUrl, value)
    })

    return this
  }

  reset(): this {
    this.sureNotFrozen('reset')

    this.invalidateCacheAll()

    this.#url = {
      protocol: 'http:',
      hostname: 'localhost',
      port: '80',
      pathname: '/',
      search: '',
      hash: ''
    }

    return this
  }

  getHost(): string {
    const { protocol, hostname, port } = this.#url

    if ((protocol === 'http:' && port === '80') || (protocol === 'https:' && port === '443')) {
      return hostname
    } else {
      return [hostname, port].join(':')
    }
  }

  readonly parseQueryStringOptions: HttpParseQueryStringOptions = {}
  readonly formatQueryStringOptions: HttpFormatQueryStringOptions = {}

  #cacheQueryString: HttpQueryString | null = null

  getQueryString(): HttpQueryString {
    if (this.#cacheQueryString != null) {
      return this.#cacheQueryString
    }

    const value = this.get('search')
    const queryString = parseQueryString(value, {
      ...this.parseQueryStringOptions,
      ignoreQueryPrefix: true
      // ...
    })

    this.#cacheQueryString = queryString

    return queryString
  }

  setQueryString(queryString: HttpQueryString): this {
    this.sureNotFrozen('setQueryString')

    const value = formatQueryString(queryString, {
      ...this.formatQueryStringOptions,
      addQueryPrefix: true
      // ...
    })
    this.set('search', value)

    this.#cacheQueryString = queryString

    return this
  }

  isPathEquals(arg: string | string[]): boolean {
    const paths = Array.isArray(arg) ? arg : [arg]
    return paths.some((path) => path === this.#url.pathname)
  }

  isPathUnder(arg: string | string[]): boolean {
    const paths = Array.isArray(arg) ? arg : [arg]
    return paths.some((path) => this.#url.pathname.startsWith(path))
  }

  isPathMatch(arg: RegExp | RegExp[]): boolean {
    const paths = Array.isArray(arg) ? arg : [arg]
    return paths.some((path) => path.test(this.#url.pathname))
  }

  toObject(): HttpUrl {
    return { ...this.#url }
  }

  toRelative(): string {
    return [this.#url.pathname, this.#url.search, this.#url.hash].join('')
  }

  toAbsolute(): string {
    return [
      this.#url.protocol,
      '//',
      this.getHost(),
      this.#url.pathname,
      this.#url.search,
      this.#url.hash
    ].join('')
  }

  protected sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Url frozen on ${name}`)
    }
  }

  protected invalidateCacheFor(name: keyof HttpUrl) {
    if (name === 'search') {
      this.#cacheQueryString = null
    }
  }

  protected invalidateCacheAll() {
    this.#cacheQueryString = null
  }
}

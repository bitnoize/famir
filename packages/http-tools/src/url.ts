import { HttpQueryString, HttpUrl } from '@famir/http-proto'
import {
  formatQueryString,
  FormatQueryStringOptions,
  parseQueryString,
  ParseQueryStringOptions,
} from './query-string.js'

/**
 * Wrapper for HTTP message URL.
 *
 * @category none
 */
export class HttpUrlWrap {
  /**
   * Factory method to create wrapper from scratch.
   *
   * @returns New wrapper instance
   */
  static fromScratch(): HttpUrlWrap {
    return HttpUrlWrap.fromRelative('/')
  }

  /**
   * Factory method to create wrapper from request-like object.
   *
   * @param req - Object with optional url property
   * @returns New wrapper instance
   * @throws If req.url is not defined
   */
  static fromReq(req: { url?: string | undefined }): HttpUrlWrap {
    if (req.url == null) {
      throw new Error(`Url not defined`)
    }

    return HttpUrlWrap.fromRelative(req.url)
  }

  /**
   * Factory method to create wrapper from relative URL string.
   *
   * @param value - Relative URL string
   * @returns New wrapper instance
   * @throws If URL cannot be parsed
   */
  static fromRelative(value: string): HttpUrlWrap {
    const parsedUrl = URL.parse(value, 'http://localhost')

    if (!parsedUrl) {
      throw new Error(`Url parse error`)
    }

    return new HttpUrlWrap({
      protocol: 'http:',
      hostname: 'localhost',
      port: '',
      pathname: parsedUrl.pathname,
      search: parsedUrl.search,
      hash: parsedUrl.hash,
    })
  }

  /**
   * Factory method to create wrapper from absolute URL string.
   *
   * @param value - Absolute URL string
   * @returns New wrapper instance
   * @throws If URL cannot be parsed
   */
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
      hash: parsedUrl.hash,
    })
  }

  #url: HttpUrl

  constructor(url: HttpUrl) {
    this.#url = url
  }

  /**
   * Clone wrapper with a copy of the URL.
   *
   * @returns New independent wrapper instance
   */
  clone(): HttpUrlWrap {
    return new HttpUrlWrap({ ...this.#url })
  }

  #isFrozen: boolean = false

  /**
   * Check if wrapper is frozen (read-only).
   *
   * @returns true if wrapper is frozen, false otherwise
   */
  get isFrozen(): boolean {
    return this.#isFrozen
  }

  /**
   * Freeze wrapper to prevent modifications.
   *
   * @returns This wrapper for method chaining
   */
  freeze(): this {
    this.#isFrozen = true

    return this
  }

  /**
   * Get URL part by name.
   *
   * @param name - URL component name (protocol, hostname, port, pathname, search, hash)
   * @returns Value of the URL component
   */
  get<K extends keyof HttpUrl>(name: K): HttpUrl[K] {
    return this.#url[name]
  }

  /**
   * Set URL part by name.
   *
   * @param name - URL component name (protocol, hostname, port, pathname, search, hash)
   * @param value - New value for the component
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  set<K extends keyof HttpUrl>(name: K, value: HttpUrl[K]): this {
    this.sureNotFrozen('set')

    this.invalidateCacheFor(name)

    this.#url[name] = value

    return this
  }

  /**
   * Merge partial URL object.
   *
   * @param url - Partial URL object with properties to update
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  merge(url: Partial<HttpUrl>): this {
    this.sureNotFrozen('merge')

    Object.entries(url).forEach(([name, value]) => {
      this.set(name as keyof HttpUrl, value)
    })

    return this
  }

  /**
   * Get host part (hostname:port or just hostname).
   *
   * @returns Host string
   */
  getHost(): string {
    const { protocol, hostname, port } = this.#url

    if (
      !port ||
      (protocol === 'http:' && port === '80') ||
      (protocol === 'https:' && port === '443')
    ) {
      return hostname
    } else {
      return [hostname, port].join(':')
    }
  }

  /**
   * Custom options for parsing query strings.
   */
  readonly parseQueryStringOptions: ParseQueryStringOptions = {}

  /**
   * Custom options for formatting query strings.
   */
  readonly formatQueryStringOptions: FormatQueryStringOptions = {}

  #cacheQueryString: HttpQueryString | null = null

  /**
   * Get URL query string as parsed object (cached).
   *
   * @returns Parsed query string as object
   */
  getQueryString(): HttpQueryString {
    if (this.#cacheQueryString != null) {
      return this.#cacheQueryString
    }

    const value = this.get('search')
    const queryString = parseQueryString(value, {
      ...this.parseQueryStringOptions,
      ignoreQueryPrefix: true,
      // ...
    })

    this.#cacheQueryString = queryString

    return queryString
  }

  /**
   * Set URL query string from object.
   *
   * @param queryString - Query string object
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  setQueryString(queryString: HttpQueryString): this {
    this.sureNotFrozen('setQueryString')

    const value = formatQueryString(queryString, {
      ...this.formatQueryStringOptions,
      addQueryPrefix: true,
      // ...
    })
    this.set('search', value)

    this.#cacheQueryString = queryString

    return this
  }

  /**
   * Match URL pathname against string or regex.
   *
   * @param value - String path or RegExp pattern
   * @returns true if pathname matches, false otherwise
   */
  isPath(value: string | RegExp): boolean {
    if (typeof value === 'string') {
      return value === this.#url.pathname
    } else if (value instanceof RegExp) {
      return value.test(this.#url.pathname)
    } else {
      throw new Error(`Test path unknown value`)
    }
  }

  /**
   * Get URL as object.
   *
   * @returns Copy of URL object
   */
  toObject(): HttpUrl {
    return { ...this.#url }
  }

  /**
   * Get URL as relative string.
   *
   * @returns Relative URL string
   */
  toRelative(): string {
    return [this.#url.pathname, this.#url.search, this.#url.hash].join('')
  }

  /**
   * Get URL as absolute string.
   *
   * @returns Absolute URL string
   */
  toAbsolute(): string {
    return [
      this.#url.protocol,
      '//',
      this.getHost(),
      this.#url.pathname,
      this.#url.search,
      this.#url.hash,
    ].join('')
  }

  /**
   * Clear URL and reset to default.
   *
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  reset(): this {
    this.sureNotFrozen('reset')

    this.invalidateCacheAll()

    this.#url = {
      protocol: 'http:',
      hostname: 'localhost',
      port: '',
      pathname: '/',
      search: '',
      hash: '',
    }

    return this
  }

  private sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Url frozen on ${name}`)
    }
  }

  private invalidateCacheFor(name: keyof HttpUrl) {
    if (name === 'search') {
      this.#cacheQueryString = null
    }
  }

  private invalidateCacheAll() {
    this.#cacheQueryString = null
  }
}

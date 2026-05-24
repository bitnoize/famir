import { HttpQueryString, HttpUrl } from '@famir/http-proto'
import {
  formatQueryString,
  FormatQueryStringOptions,
  parseQueryString,
  ParseQueryStringOptions,
} from './query-string.js'

/**
 * Wrapper class for HTTP message URLs.
 */
export class HttpUrlWrap {
  /**
   * Factory method to create a wrapper from scratch.
   *
   * @returns A new wrapper instance with default values.
   */
  static fromScratch(): HttpUrlWrap {
    return HttpUrlWrap.fromRelative('/')
  }

  /**
   * Factory method to create a wrapper from a request-like object.
   *
   * @param req - The object with an optional `url` property.
   * @returns A new wrapper instance.
   * @throws Error If `req.url` is not defined.
   */
  static fromReq(req: { url?: string | undefined }): HttpUrlWrap {
    if (req.url == null) {
      throw new Error(`Url not defined`)
    }

    return HttpUrlWrap.fromRelative(req.url)
  }

  /**
   * Factory method to create a wrapper from a relative URL string.
   *
   * @param value - The relative URL string.
   * @returns A new wrapper instance.
   * @throws Error If the URL cannot be parsed.
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
   * Factory method to create a wrapper from an absolute URL string.
   *
   * @param value - The absolute URL string.
   * @returns A new wrapper instance.
   * @throws Error If the URL cannot be parsed.
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

  /**
   * Creates a new wrapper instance.
   *
   * @param url - The URL object to wrap.
   */
  constructor(url: HttpUrl) {
    this.#url = url
  }

  /**
   * Clones the wrapper with a copy of the URL.
   *
   * @returns A new independent wrapper instance.
   */
  clone(): HttpUrlWrap {
    return new HttpUrlWrap({ ...this.#url })
  }

  #isFrozen: boolean = false

  /**
   * Checks if the wrapper is frozen (read-only).
   *
   * @returns `true` if the wrapper is frozen, `false` otherwise.
   */
  get isFrozen(): boolean {
    return this.#isFrozen
  }

  /**
   * Freezes the wrapper to prevent modifications.
   *
   * @returns This wrapper for method chaining.
   */
  freeze(): this {
    this.#isFrozen = true

    return this
  }

  /**
   * Gets a URL component by name.
   *
   * @param name - The name of the URL component.
   * @returns The value of the URL component.
   */
  get<K extends keyof HttpUrl>(name: K): HttpUrl[K] {
    return this.#url[name]
  }

  /**
   * Sets a URL component by name.
   *
   * @param name - The name of the URL component to set.
   * @param value - The new value for the component.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   */
  set<K extends keyof HttpUrl>(name: K, value: HttpUrl[K]): this {
    this.sureNotFrozen('set')

    this.invalidateCacheFor(name)

    this.#url[name] = value

    return this
  }

  /**
   * Merges a partial URL object into the current URL.
   *
   * @param url - The partial URL object with properties to update.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   */
  merge(url: Partial<HttpUrl>): this {
    this.sureNotFrozen('merge')

    Object.entries(url).forEach(([name, value]) => {
      this.set(name as keyof HttpUrl, value)
    })

    return this
  }

  /**
   * Gets the host part.
   *
   * @returns The host string.
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

  /** Custom options for parsing query strings. */
  readonly parseQueryStringOptions: ParseQueryStringOptions = {}

  /** Custom options for formatting query strings. */
  readonly formatQueryStringOptions: FormatQueryStringOptions = {}

  #cacheQueryString: HttpQueryString | null = null

  /**
   * Gets the URL query string as a parsed object (cached).
   *
   * @returns The parsed query string as an object.
   * @throws Error If parsing the query string fails.
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
   * Sets the URL query string from an object.
   *
   * @param queryString - The query string object to set.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   * @throws Error If formatting the query string fails.
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
   * Checks if the URL pathname matches a string or regular expression.
   *
   * @param value - The string path or RegExp pattern to match.
   * @returns `true` if the pathname matches, `false` otherwise.
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
   * Returns the URL as an object.
   *
   * @returns A copy of the URL object.
   */
  toObject(): HttpUrl {
    return { ...this.#url }
  }

  /**
   * Returns the URL as a relative string.
   *
   * @returns The relative URL string.
   */
  toRelative(): string {
    return [this.#url.pathname, this.#url.search, this.#url.hash].join('')
  }

  /**
   * Returns the URL as an absolute string.
   *
   * @returns The absolute URL string.
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
   * Resets the URL to default values.
   *
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
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

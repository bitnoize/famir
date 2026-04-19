import { HttpUrl } from '@famir/common'
import {
  formatQueryString,
  HttpFormatQueryStringOptions,
  HttpParseQueryStringOptions,
  HttpQueryString,
  parseQueryString,
} from './query-string.js'

/**
 * Represents a HTTP URL wrapper
 * @category none
 */
export class HttpUrlWrap {
  /**
   * Create wrapper from scratch
   */
  static fromScratch(): HttpUrlWrap {
    return HttpUrlWrap.fromRelative('/')
  }

  /**
   * Create wrapper from req object
   */
  static fromReq(req: { url?: string | undefined }): HttpUrlWrap {
    if (req.url == null) {
      throw new Error(`Url not defined`)
    }

    return HttpUrlWrap.fromRelative(req.url)
  }

  /**
   * Create wrapper from relative url
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
   * Create wrapper from absolute url
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
   * Clone wrapper
   */
  clone(): HttpUrlWrap {
    return new HttpUrlWrap({ ...this.#url })
  }

  #isFrozen: boolean = false

  /**
   * Wrapper frozen state
   */
  get isFrozen(): boolean {
    return this.#isFrozen
  }

  /**
   * Freeze wrapper
   */
  freeze(): this {
    this.#isFrozen = true

    return this
  }

  /**
   * Get url part
   */
  get<K extends keyof HttpUrl>(name: K): HttpUrl[K] {
    return this.#url[name]
  }

  /**
   * Set url part
   */
  set<K extends keyof HttpUrl>(name: K, value: HttpUrl[K]): this {
    this.sureNotFrozen('set')

    this.invalidateCacheFor(name)

    this.#url[name] = value

    return this
  }

  /**
   * Merge partial url
   */
  merge(url: Partial<HttpUrl>): this {
    this.sureNotFrozen('merge')

    Object.entries(url).forEach(([name, value]) => {
      this.set(name as keyof HttpUrl, value)
    })

    return this
  }

  /**
   * Get url host part
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
   * Custom parse query-string options
   */
  readonly parseQueryStringOptions: HttpParseQueryStringOptions = {}

  /**
   * Custom format query-string options
   */
  readonly formatQueryStringOptions: HttpFormatQueryStringOptions = {}

  #cacheQueryString: HttpQueryString | null = null

  /**
   * Get url query-string part
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
   * Set url query-string part
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
   * Match url pathname
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
   * Get url object
   */
  toObject(): HttpUrl {
    return { ...this.#url }
  }

  /**
   * Get relative url
   */
  toRelative(): string {
    return [this.#url.pathname, this.#url.search, this.#url.hash].join('')
  }

  /**
   * Get absolute url
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
   * Cleanup wrapper
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

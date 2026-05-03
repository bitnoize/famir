import {
  HttpContentType,
  HttpCookies,
  HttpHeader,
  HttpHeaders,
  HttpSetCookies,
  HttpStrictHeaders,
} from '@famir/http-proto'
import { formatContentType, parseContentType } from './content-type.js'
import { formatCookies, formatSetCookies, parseCookies, parseSetCookies } from './cookies.js'

/**
 * Wrapper for HTTP message headers.
 *
 * @category none
 */
export class HttpHeadersWrap {
  /**
   * Factory method to create wrapper from scratch.
   *
   * @returns New wrapper instance
   */
  static fromScratch(): HttpHeadersWrap {
    return new HttpHeadersWrap({})
  }

  /**
   * Factory method to create wrapper from request-like object.
   *
   * @param req - Object with headers property
   * @returns New wrapper instance
   */
  static fromReq(req: { headers: HttpHeaders }): HttpHeadersWrap {
    return new HttpHeadersWrap(req.headers)
  }

  #headers: HttpHeaders

  constructor(headers: HttpHeaders) {
    this.#headers = Object.fromEntries(
      Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value])
    )
  }

  /**
   * Clone wrapper with a copy of the headers.
   *
   * @returns New independent wrapper instance
   */
  clone(): HttpHeadersWrap {
    return new HttpHeadersWrap({ ...this.#headers })
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
   * Get headers length (number of keys in object).
   *
   * @returns Size of the body
   */
  get length(): number {
    return Object.keys(this.#headers).length
  }

  /**
   * Get header value as string or array of strings.
   *
   * @param name - Header name
   * @returns Header value as string or array of strings or undefined if header is not exists
   */
  get(name: string): HttpHeader | undefined {
    const normName = name.toLowerCase()

    return this.#headers[normName]
  }

  /**
   * Get header value as string.
   *
   * @param name - Header name
   * @returns Header value as string or undefined if header is not exists
   */
  getString(name: string): string | undefined {
    const value = this.get(name)

    if (value == null) {
      return undefined
    }

    if (Array.isArray(value)) {
      return value[0] != null ? value[0] : undefined
    }

    return value
  }

  /**
   * Get header values as array of strings.
   *
   * @param name - Header name
   * @returns Header values as array of strings or undefined if header is not exists
   */
  getArray(name: string): string[] | undefined {
    const value = this.get(name)

    if (value == null) {
      return undefined
    }

    if (Array.isArray(value)) {
      return value
    }

    return [value]
  }

  /**
   * Set header value.
   *
   * @param name - Header name
   * @param value - New header value
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  set(name: string, value: HttpHeader): this {
    this.sureNotFrozen('set')

    const normName = name.toLowerCase()

    this.invalidateCacheFor(normName)

    this.#headers[normName] = value

    return this
  }

  /**
   * Append value to exists header or create a new one.
   *
   * @param name - Header name
   * @param value - New header value to be added
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  add(name: string, value: string): this {
    this.sureNotFrozen('add')

    const curValue = this.get(name)

    if (curValue == null) {
      this.set(name, value)
    } else if (Array.isArray(curValue)) {
      this.set(name, [...curValue, value])
    } else {
      this.set(name, [curValue, value])
    }

    return this
  }

  /**
   * Check header exists
   *
   * @param name - Header name
   * @returns true if header exists, false otherwise
   */
  has(name: string): boolean {
    const normName = name.toLowerCase()

    return this.#headers[normName] != null
  }

  /**
   * Delete header(s)
   *
   * @param arg - Single name string or array of names to delete
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  delete(arg: string | string[]): this {
    this.sureNotFrozen('delete')

    const names = Array.isArray(arg) ? arg : [arg]

    names.forEach((name) => {
      const normName = name.toLowerCase()

      this.invalidateCacheFor(normName)

      this.#headers[normName] = undefined
    })

    return this
  }

  /**
   * Merge headers.
   *
   * @param headers - Headers object to merge from
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  merge(headers: HttpHeaders): this {
    this.sureNotFrozen('merge')

    Object.entries(headers).forEach(([name, value]) => {
      if (value != null) {
        this.set(name, value)
      }
    })

    return this
  }

  #cacheContentType: HttpContentType | null = null

  /**
   * Get content-type header as parsed object (cached).
   *
   * @returns Parsed content-type as object, or null if header is not exists
   * @throws If invalid content-type format
   */
  getContentType(): HttpContentType | null {
    if (this.#cacheContentType != null) {
      return this.#cacheContentType
    }

    const value = this.getString('Content-Type')
    if (value == null) {
      return null
    }

    this.#cacheContentType = parseContentType(value)

    return this.#cacheContentType
  }

  /**
   * Set content-type header from object.
   *
   * @param contentType - Content-type object
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  setContentType(contentType: HttpContentType): this {
    this.sureNotFrozen('setContentType')

    const value = formatContentType(contentType)
    this.set('Content-Type', value)

    this.#cacheContentType = contentType

    return this
  }

  #cacheCookies: HttpCookies | null = null

  /**
   * Get cookie header as parsed object (cached).
   *
   * @returns Parsed cookie as object, or null if header is not exists
   */
  getCookies(): HttpCookies | null {
    if (this.#cacheCookies != null) {
      return this.#cacheCookies
    }

    const values = this.getArray('Cookie')
    if (values == null) {
      return null
    }

    this.#cacheCookies = parseCookies(values)

    return this.#cacheCookies
  }

  /**
   * Set cookie header from object.
   *
   * @param cookies - Cookies object
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  setCookies(cookies: HttpCookies): this {
    this.sureNotFrozen('setCookies')

    const value = formatCookies(cookies)
    this.set('Cookie', value)

    this.#cacheCookies = cookies

    return this
  }

  #cacheSetCookies: HttpSetCookies | null = null

  /**
   * Get set-cookie header as parsed object (cached).
   *
   * @returns Parsed set-cookie as object, or null if header is not exists
   */
  getSetCookies(): HttpSetCookies | null {
    if (this.#cacheSetCookies != null) {
      return this.#cacheSetCookies
    }

    const values = this.getArray('Set-Cookie')
    if (values == null) {
      return null
    }

    this.#cacheSetCookies = parseSetCookies(values)

    return this.#cacheSetCookies
  }

  /**
   * Set set-cookie header from object.
   *
   * @param setCookies - SetCookies object
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  setSetCookies(setCookies: HttpSetCookies): this {
    this.sureNotFrozen('setSetCookies')

    const values = formatSetCookies(setCookies)
    this.set('Set-Cookie', values)

    this.#cacheSetCookies = setCookies

    return this
  }

  /**
   * Get headers as object.
   *
   * @returns Copy of headers object
   */
  toObject(): HttpStrictHeaders {
    const strictHeaders: HttpStrictHeaders = {}

    Object.entries(this.#headers).forEach(([name, value]) => {
      if (value != null) {
        strictHeaders[name] = value
      }
    })

    return strictHeaders
  }

  /**
   * Get headers as array of entries.
   *
   * @returns Array of headers entries
   */
  entries(): [string, HttpHeader][] {
    return Object.entries(this.toObject())
  }

  /**
   * Loop over headers entries.
   *
   * @param cb - Callback function
   * @returns This wrapper for method chaining
   */
  forEach(cb: (name: string, value: HttpHeader) => void): this {
    this.entries().forEach(([name, value]) => {
      cb(name, value)
    })

    return this
  }

  /**
   * Clear headers and reset to default.
   *
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  reset(): this {
    this.sureNotFrozen('reset')

    this.invalidateCacheAll()

    this.#headers = {}

    return this
  }

  private sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Headers frozen on ${name}`)
    }
  }

  private invalidateCacheFor(name: string) {
    if (name === 'content-type') {
      this.#cacheContentType = null
    } else if (name === 'cookie') {
      this.#cacheCookies = null
    } else if (name === 'set-cookie') {
      this.#cacheSetCookies = null
    }
  }

  private invalidateCacheAll() {
    this.#cacheContentType = null
    this.#cacheCookies = null
    this.#cacheSetCookies = null
  }
}

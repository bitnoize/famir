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
 * Wrapper class for HTTP message headers.
 */
export class HttpHeadersWrap {
  /**
   * Factory method to create a wrapper from scratch.
   *
   * @returns A new wrapper instance with empty headers.
   */
  static fromScratch(): HttpHeadersWrap {
    return new HttpHeadersWrap({})
  }

  /**
   * Factory method to create a wrapper from a request-like object.
   *
   * @param req - An object with a `headers` property.
   * @returns A new wrapper instance.
   */
  static fromReq(req: { headers: HttpHeaders }): HttpHeadersWrap {
    return new HttpHeadersWrap(req.headers)
  }

  #headers: HttpHeaders

  /**
   * Creates a new wrapper instance.
   *
   * @param headers - The headers object to wrap.
   */
  constructor(headers: HttpHeaders) {
    this.#headers = Object.fromEntries(
      Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value])
    )
  }

  /**
   * Clones the wrapper with a copy of the headers.
   *
   * @returns A new independent wrapper instance.
   */
  clone(): HttpHeadersWrap {
    return new HttpHeadersWrap({ ...this.#headers })
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
   * Gets the number of headers.
   *
   * @returns The number of headers in the object.
   */
  get length(): number {
    return Object.keys(this.#headers).length
  }

  /**
   * Gets a header value as a string or array of strings.
   *
   * @param name - The header name (case-insensitive).
   * @returns The header value, or `undefined` if the header does not exist.
   */
  get(name: string): HttpHeader | undefined {
    const normName = name.toLowerCase()

    return this.#headers[normName]
  }

  /**
   * Gets a header value as a single string.
   *
   * @param name - The header name (case-insensitive).
   * @returns The first header value, or `undefined` if the header does not exist.
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
   * Gets a header value as an array of strings.
   *
   * @param name - The header name (case-insensitive).
   * @returns The header values as an array, or `undefined` if the header does not exist.
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
   * Sets a header value.
   *
   * @param name - The header name (case-insensitive).
   * @param value - The new header value.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   */
  set(name: string, value: HttpHeader): this {
    this.sureNotFrozen('set')

    const normName = name.toLowerCase()

    this.invalidateCacheFor(normName)

    this.#headers[normName] = value

    return this
  }

  /**
   * Appends a value to an existing header or creates a new one.
   *
   * @param name - The header name (case-insensitive).
   * @param value - The value to append.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
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
   * Checks if a header exists.
   *
   * @param name - The header name (case-insensitive).
   * @returns `true` if the header exists, `false` otherwise.
   */
  has(name: string): boolean {
    const normName = name.toLowerCase()

    return this.#headers[normName] != null
  }

  /**
   * Deletes one or more headers.
   *
   * @param arg - The single header name or the array of names to delete.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
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
   * Merges headers from another object.
   *
   * @param headers - The headers object to merge from.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
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
   * Gets the Content-Type header as a parsed object (cached).
   *
   * @returns The parsed Content-Type object, or `null` if the header is not present.
   * @throws Error If Content-Type parsing fails.
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
   * Sets the Content-Type header from an object.
   *
   * @param contentType - The Content-Type object.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   * @throws Error If Content-Type formatting fails.
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
   * Gets the Cookie header as a parsed object (cached).
   *
   * @returns The parsed cookies object, or `null` if the header is not present.
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
   * Sets the Cookie header from an object.
   *
   * @param cookies - The cookies object.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
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
   * Gets the Set-Cookie header as a parsed object (cached).
   *
   * @returns The parsed Set-Cookie object, or `null` if the header is not present.
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
   * Sets the Set-Cookie header from an object.
   *
   * @param setCookies - The Set-Cookie object.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   */
  setSetCookies(setCookies: HttpSetCookies): this {
    this.sureNotFrozen('setSetCookies')

    const values = formatSetCookies(setCookies)
    this.set('Set-Cookie', values)

    this.#cacheSetCookies = setCookies

    return this
  }

  /**
   * Gets the headers as a strict headers object.
   *
   * @returns A copy of the headers object with all undefined values removed.
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
   * Gets the headers as an array of entries.
   *
   * @returns The array of `[name, value]` pairs.
   */
  entries(): [string, HttpHeader][] {
    return Object.entries(this.toObject())
  }

  /**
   * Iterates over all headers.
   *
   * @param cb - The callback function to call for each header.
   * @returns This wrapper for method chaining.
   */
  forEach(cb: (name: string, value: HttpHeader) => void): this {
    this.entries().forEach(([name, value]) => {
      cb(name, value)
    })

    return this
  }

  /**
   * Clears all headers and resets to an empty state.
   *
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
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

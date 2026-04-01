import { HttpHeader, HttpHeaders, HttpStrictHeaders } from '@famir/common'
import { HttpContentType, formatContentType, parseContentType } from './content-type.js'
import {
  HttpCookies,
  HttpSetCookies,
  formatCookies,
  formatSetCookies,
  parseCookies,
  parseSetCookies
} from './cookies.js'

/*
 * HTTP headers wrapper
 */
export class HttpHeadersWrap {
  /*
   * Create wrapper from scratch
   */
  static fromScratch(): HttpHeadersWrap {
    return new HttpHeadersWrap({})
  }

  /*
   * Create wrapper from req object
   */
  static fromReq(req: { headers: HttpHeaders }): HttpHeadersWrap {
    return new HttpHeadersWrap(req.headers)
  }

  #headers: HttpHeaders

  constructor(headers: HttpHeaders) {
    this.#headers = headers
  }

  /*
   * Clone wrapper
   */
  clone(): HttpHeadersWrap {
    return new HttpHeadersWrap({ ...this.#headers })
  }

  #isFrozen: boolean = false

  /*
   * Wrapper frozen state
   */
  get isFrozen(): boolean {
    return this.#isFrozen
  }

  /*
   * Freeze wrapper
   */
  freeze(): this {
    this.#isFrozen = true

    return this
  }

  /*
   * Get header value
   */
  get(name: string): HttpHeader | undefined {
    const normName = name.toLowerCase()

    return this.#headers[normName]
  }

  /*
   * Get header string
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

  /*
   * Get header array
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

  /*
   * Set header value
   */
  set(name: string, value: HttpHeader): this {
    this.sureNotFrozen('set')

    const normName = name.toLowerCase()

    this.invalidateCacheFor(normName)

    this.#headers[normName] = value

    return this
  }

  /*
   * Add header value
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

  /*
   * Check header exists
   */
  has(name: string): boolean {
    const normName = name.toLowerCase()

    return normName in this.#headers
  }

  /*
   * Delete headers
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

  /*
   * Merge headers
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

  /*
   * Get content-type header
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

  /*
   * Set content-type header
   */
  setContentType(contentType: HttpContentType): this {
    this.sureNotFrozen('setContentType')

    const value = formatContentType(contentType)
    this.set('Content-Type', value)

    this.#cacheContentType = contentType

    return this
  }

  #cacheCookies: HttpCookies | null = null

  /*
   * Get cookie header
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

  /*
   * Set cookie header
   */
  setCookies(cookies: HttpCookies): this {
    this.sureNotFrozen('setCookies')

    const value = formatCookies(cookies)
    this.set('Cookie', value)

    this.#cacheCookies = cookies

    return this
  }

  #cacheSetCookies: HttpSetCookies | null = null

  /*
   * Get set-cookie header
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

  /*
   * Set set-cookie header
   */
  setSetCookies(setCookies: HttpSetCookies): this {
    this.sureNotFrozen('setSetCookies')

    const values = formatSetCookies(setCookies)
    this.set('Set-Cookie', values)

    this.#cacheSetCookies = setCookies

    return this
  }

  /*
   * Get headers object
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

  /*
   * Get headers entries
   */
  entries(): [string, HttpHeader][] {
    return Object.entries(this.toObject())
  }

  /*
   * Loop over headers
   */
  forEach(cb: (name: string, value: HttpHeader) => void): this {
    this.entries().forEach(([name, value]) => {
      cb(name, value)
    })

    return this
  }

  /*
   * Cleanup wrapper
   */
  reset(): this {
    this.sureNotFrozen('reset')

    this.invalidateCacheAll()

    this.#headers = {}

    return this
  }

  protected sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Headers frozen on ${name}`)
    }
  }

  protected invalidateCacheFor(name: string) {
    if (name === 'content-type') {
      this.#cacheContentType = null
    } else if (name === 'cookie') {
      this.#cacheCookies = null
    } else if (name === 'set-cookie') {
      this.#cacheSetCookies = null
    }
  }

  protected invalidateCacheAll() {
    this.#cacheContentType = null
    this.#cacheCookies = null
    this.#cacheSetCookies = null
  }
}

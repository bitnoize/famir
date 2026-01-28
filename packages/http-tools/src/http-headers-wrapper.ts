import {
  HttpContentType,
  HttpCookies,
  HttpHeader,
  HttpHeaders,
  HttpHeadersWrapper,
  HttpSetCookies,
  HttpStrictHeaders
} from '@famir/domain'
import contenttype from 'content-type'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Cookie } from 'tough-cookie'

export class StdHttpHeadersWrapper implements HttpHeadersWrapper {
  static fromReq(req: IncomingMessage): HttpHeadersWrapper {
    const headers: HttpHeaders = { ...req.headers }

    return new StdHttpHeadersWrapper(headers)
  }

  static fromRes(res: ServerResponse): HttpHeadersWrapper {
    const headers: HttpHeaders = {}

    res.getHeaderNames().forEach((name) => {
      const value = res.getHeader(name)

      if (value != null) {
        headers[name] = typeof value === 'string' ? value : value.toString()
      }
    })

    return new StdHttpHeadersWrapper(headers)
  }

  #headers: HttpHeaders

  protected isFrozen: boolean = false

  constructor(headers: HttpHeaders) {
    this.#headers = headers
  }

  clone(): HttpHeadersWrapper {
    return new StdHttpHeadersWrapper(this.#headers)
  }

  freeze(): this {
    this.isFrozen ||= true

    return this
  }

  get(name: string): HttpHeader | undefined {
    name = name.toLowerCase()

    return this.#headers[name]
  }

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

  set(name: string, value: HttpHeader | undefined, force = false): this {
    this.sureNotFrozen('set')

    name = name.toLowerCase()

    if (value != null || force) {
      this.#headers[name] = value
    }

    return this
  }

  add(name: string, value: string): this {
    this.sureNotFrozen('add')

    name = name.toLowerCase()

    const curValue = this.#headers[name]

    if (curValue == null) {
      this.#headers[name] = value
    } else if (Array.isArray(curValue)) {
      this.#headers[name] = [...curValue, value]
    } else {
      this.#headers[name] = [curValue, value]
    }

    return this
  }

  has(name: string): boolean {
    name = name.toLowerCase()

    return name in this.#headers
  }

  delete(arg: string | string[]): this {
    this.sureNotFrozen('delete')

    const names = Array.isArray(arg) ? arg : [arg]

    names.forEach((name) => {
      this.set(name, undefined, true)
    })

    return this
  }

  merge(headers: HttpHeaders, force = false): this {
    this.sureNotFrozen('merge')

    Object.entries(headers).forEach(([name, value]) => {
      this.set(name, value, force)
    })

    return this
  }

  reset(): this {
    this.sureNotFrozen('reset')

    this.#headers = {}

    return this
  }

  getContentType(): HttpContentType {
    const value = this.getString('Content-Type') ?? ''
    return contenttype.parse(value)
  }

  setContentType(contentType: HttpContentType): this {
    this.sureNotFrozen('setContentType')

    const value = contenttype.format(contentType)
    this.set('Content-Type', value)

    return this
  }

  getCookies(): HttpCookies {
    const value = this.getString('Cookie') ?? ''
    return this.parseCookies(value)
  }

  setCookies(cookies: HttpCookies): this {
    this.sureNotFrozen('setCookies')

    const value = this.formatCookies(cookies)
    this.set('Cookie', value)

    return this
  }

  getSetCookies(): HttpSetCookies {
    const values = this.getArray('Set-Cookie') ?? []
    return this.parseSetCookies(values)
  }

  setSetCookies(cookies: HttpSetCookies): this {
    this.sureNotFrozen('setSetCookies')

    const values = this.formatSetCookies(cookies)
    this.set('Set-Cookie', values)

    return this
  }

  toObject(): HttpStrictHeaders {
    const strictHeaders: HttpStrictHeaders = {}

    Object.entries(this.#headers).forEach(([name, value]) => {
      if (value != null) {
        strictHeaders[name] = value
      }
    })

    return strictHeaders
  }

  entries(): Array<[string, HttpHeader]> {
    return Object.entries(this.toObject())
  }

  forEach(cb: (name: string, value: HttpHeader) => void): this {
    this.entries().forEach(([name, value]) => {
      cb(name, value)
    })

    return this
  }

  protected sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Headers frozen on ${name}`)
    }
  }

  private parseCookies(value: string): HttpCookies {
    const cookies: HttpCookies = {}

    value.split(';').forEach((rawCookie) => {
      const toughCookie = Cookie.parse(rawCookie, {
        //loose: true
      })

      if (toughCookie) {
        cookies[toughCookie.key] = toughCookie.value
      }
    })

    return cookies
  }

  private formatCookies(cookies: HttpCookies): string {
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

  private parseSetCookies(values: string[]): HttpSetCookies {
    const cookies: HttpSetCookies = {}

    values
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

  private formatSetCookies(cookies: HttpSetCookies): string {
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

    return toughCookies.map((toughCookie) => toughCookie.toString()).join(';')
  }
}

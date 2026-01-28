import { HttpQueryString, HttpUrl, HttpUrlWrapper } from '@famir/domain'
import { IncomingMessage } from 'node:http'
import { URL } from 'node:url'
import qs from 'qs'

export class StdHttpUrlWrapper implements HttpUrlWrapper {
  static fromReq(req: IncomingMessage): HttpUrlWrapper {
    if (req.url == null) {
      throw new Error(`Url not defined`)
    }

    return StdHttpUrlWrapper.fromString(req.url)
  }

  static fromString(str: string): HttpUrlWrapper {
    const parsedUrl = URL.parse(str, 'http://localhost')

    if (!parsedUrl) {
      throw new Error(`Url parse error`)
    }

    const url: HttpUrl = {
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      pathname: parsedUrl.pathname,
      search: parsedUrl.search,
      hash: parsedUrl.hash
    }

    return new StdHttpUrlWrapper(url)
  }

  #url: HttpUrl

  protected isFrozen: boolean = false

  constructor(url: HttpUrl) {
    this.#url = url
  }

  clone(): HttpUrlWrapper {
    return new StdHttpUrlWrapper(this.#url)
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

    this.#url[name] = value

    return this
  }

  update(url: Partial<HttpUrl>): this {
    this.sureNotFrozen('update')

    this.#url = { ...this.#url, ...url }

    return this
  }

  getHost(): string {
    return this.#url.port ? this.#url.hostname + ':' + this.#url.port : this.#url.hostname
  }

  getSearchParams(): HttpQueryString {
    return qs.parse(this.#url.search, {
      ignoreQueryPrefix: true
    })
  }

  setSearchParams(searchParams: HttpQueryString): this {
    this.sureNotFrozen('setSearchParams')

    this.#url.search = qs.stringify(searchParams, {
      addQueryPrefix: true
    })

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

  toString(relative = false): string {
    if (relative) {
      return [this.#url.pathname, this.#url.search, this.#url.hash].join('')
    } else {
      return [
        this.#url.protocol,
        '//',
        this.getHost(),
        this.#url.pathname,
        this.#url.search,
        this.#url.hash
      ].join('')
    }
  }

  protected sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Url frozen on ${name}`)
    }
  }
}

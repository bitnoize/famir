import { HttpQueryString, HttpUrl } from '../../http-proto.js'

export interface HttpUrlWrapper {
  clone(): HttpUrlWrapper
  freeze(): this
  get<K extends keyof HttpUrl>(name: K): HttpUrl[K]
  set<K extends keyof HttpUrl>(name: K, value: HttpUrl[K]): this
  update(url: Partial<HttpUrl>): this
  getHost(): string
  getSearchParams(): HttpQueryString
  setSearchParams(searchParams: HttpQueryString): this
  isPathEquals(paths: string | string[]): boolean
  isPathUnder(paths: string | string[]): boolean
  isPathMatch(paths: RegExp | RegExp[]): boolean
  toObject(): HttpUrl
  toString(relative?: boolean): string
}

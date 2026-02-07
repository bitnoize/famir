import { HttpQueryString, HttpUrl } from '../../http-proto.js'

export interface HttpUrlWrapper {
  clone(): HttpUrlWrapper
  freeze(): this
  get<K extends keyof HttpUrl>(name: K): HttpUrl[K]
  set<K extends keyof HttpUrl>(name: K, value: HttpUrl[K]): this
  merge(url: Partial<HttpUrl>): this
  reset(): this
  getHost(): string
  getQueryString(): HttpQueryString
  setQueryString(queryString: HttpQueryString): this
  isPathEquals(paths: string | string[]): boolean
  isPathUnder(paths: string | string[]): boolean
  isPathMatch(paths: RegExp | RegExp[]): boolean
  toObject(): HttpUrl
  toString(relative?: boolean): string
}

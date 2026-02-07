import {
  HttpContentType,
  HttpCookies,
  HttpHeader,
  HttpHeaders,
  HttpSetCookies,
  HttpStrictHeaders
} from '../../http-proto.js'

export interface HttpHeadersWrapper {
  clone(): HttpHeadersWrapper
  freeze(): this
  get(name: string): HttpHeader | undefined
  getString(name: string): string | undefined
  getArray(name: string): string[] | undefined
  set(name: string, value: HttpHeader, force?: boolean): this
  add(name: string, value: string): this
  has(name: string): boolean
  delete(names: string | string[]): this
  merge(headers: HttpHeaders): this
  reset(): this
  getContentType(): HttpContentType
  setContentType(contentType: HttpContentType): this
  getCookies(): HttpCookies
  setCookies(cookies: HttpCookies): this
  getSetCookies(): HttpSetCookies
  setSetCookies(cookies: HttpSetCookies): this
  toObject(): HttpStrictHeaders
  entries(): Array<[string, HttpHeader]>
  forEach(cb: (name: string, value: HttpHeader) => void): this
}

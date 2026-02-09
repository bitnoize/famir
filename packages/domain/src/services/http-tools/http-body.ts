import {
  HttpBody,
  HttpFormatQueryStringOptions,
  HttpJson,
  HttpParseQueryStringOptions,
  HttpQueryString,
  HttpText
} from '../../http-proto.js'

export interface HttpBodyWrapper {
  clone(): HttpBodyWrapper
  freeze(): this
  readonly size: number
  get(): HttpBody
  set(body: HttpBody): this
  getBase64(): string
  setBase64(str: string): this
  getText(charset?: string): HttpText
  setText(text: HttpText, charset?: string): this
  getJson(charset?: string): HttpJson
  setJson(json: HttpJson, charset?: string): this
  readonly parseQueryStringOptions: HttpParseQueryStringOptions
  readonly formatQueryStringOptions: HttpFormatQueryStringOptions
  getQueryString(charset?: string): HttpQueryString
  setQueryString(queryString: HttpQueryString, charset?: string): this
  reset(): this
}

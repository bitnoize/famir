import {
  HttpBody,
  HttpContentType,
  HttpFormatQueryStringOptions,
  HttpJson,
  HttpParseQueryStringOptions,
  HttpQueryString,
  HttpText
} from '../../http-proto.js'

export interface HttpBodyWrapper {
  clone(): HttpBodyWrapper
  freeze(): this
  get(): HttpBody
  set(body: HttpBody): this
  readonly size: number
  getText(contentType: HttpContentType): HttpText
  setText(text: HttpText, contentType: HttpContentType): this
  getJson(contentType: HttpContentType): HttpJson
  setJson(json: HttpJson, contentType: HttpContentType): this
  readonly parseQueryStringOptions: HttpParseQueryStringOptions
  readonly formatQueryStringOptions: HttpFormatQueryStringOptions
  getQueryString(contentType: HttpContentType): HttpQueryString
  setQueryString(queryString: HttpQueryString, contentType: HttpContentType): this
  reset(): this
  toBuffer(): Buffer
}

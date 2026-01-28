import { HttpBody, HttpQueryString } from '../../http-proto.js'

export interface HttpBodyWrapper {
  freeze(): this
  get(): HttpBody
  set(body: HttpBody): this
  getString(encoding?: BufferEncoding): string
  setString(value: string, encoding?: BufferEncoding): this
  getJson(encoding?: BufferEncoding): unknown
  setJson(json: object, encoding?: BufferEncoding): this
  getQueryString(encoding?: BufferEncoding): HttpQueryString
  setQueryString(queryString: HttpQueryString, encoding?: BufferEncoding): this
  reset(): this
}

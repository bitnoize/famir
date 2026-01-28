import { HttpMethod } from '../../http-proto.js'

export interface HttpMethodWrapper {
  clone(): HttpMethodWrapper
  freeze(): this
  get(): HttpMethod
  set(method: HttpMethod): this
  is(methods: HttpMethod | HttpMethod[]): boolean
}

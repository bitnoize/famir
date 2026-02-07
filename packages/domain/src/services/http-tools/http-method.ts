import { HttpMethod } from '../../http-proto.js'

export interface HttpMethodWrapper {
  get(): HttpMethod
  is(methods: HttpMethod | HttpMethod[]): boolean
}

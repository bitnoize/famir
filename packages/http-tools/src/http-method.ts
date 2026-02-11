import { arrayIncludes } from '@famir/common'
import { HTTP_METHODS, HttpMethod, HttpMethodWrapper } from '@famir/domain'

export class StdHttpMethodWrapper implements HttpMethodWrapper {
  static fromReq(req: { method?: string | undefined }): HttpMethodWrapper {
    if (req.method == null) {
      throw new Error(`Method not defined`)
    }

    return StdHttpMethodWrapper.fromString(req.method)
  }

  static fromString(value: string): HttpMethodWrapper {
    const normValue = value.toUpperCase()

    if (!arrayIncludes(HTTP_METHODS, normValue)) {
      throw new Error(`Method not known`)
    }

    return new StdHttpMethodWrapper(normValue)
  }

  #method: HttpMethod

  constructor(method: HttpMethod) {
    this.#method = method
  }

  get(): HttpMethod {
    return this.#method
  }

  is(arg: HttpMethod | HttpMethod[]): boolean {
    const methods = Array.isArray(arg) ? arg : [arg]
    return methods.includes(this.#method)
  }
}

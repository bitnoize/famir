import { arrayIncludes } from '@famir/common'

export const HTTP_METHODS = ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const
export type HttpMethod = (typeof HTTP_METHODS)[number]

export class HttpMethodWrap {
  static fromReq(req: { method?: string | undefined }): HttpMethodWrap {
    if (req.method == null) {
      throw new Error(`Method not defined`)
    }

    return HttpMethodWrap.fromString(req.method)
  }

  static fromString(value: string): HttpMethodWrap {
    const normValue = value.toUpperCase()

    if (!arrayIncludes(HTTP_METHODS, normValue)) {
      throw new Error(`Method not known`)
    }

    return new HttpMethodWrap(normValue)
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

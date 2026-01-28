import { arrayIncludes } from '@famir/common'
import { HTTP_METHODS, HttpMethod, HttpMethodWrapper } from '@famir/domain'

export class StdHttpMethodWrapper implements HttpMethodWrapper {
  static fromReq(req: { method?: string | undefined }): HttpMethodWrapper {
    if (req.method == null) {
      throw new Error(`Method not defined`)
    }

    return StdHttpMethodWrapper.fromString(req.method)
  }

  static fromString(str: string): HttpMethodWrapper {
    if (!arrayIncludes(HTTP_METHODS, str)) {
      throw new Error(`Method not known`)
    }

    return new StdHttpMethodWrapper(str)
  }

  #method: HttpMethod

  protected isFrozen: boolean = false

  constructor(method: HttpMethod) {
    this.#method = method
  }

  clone(): HttpMethodWrapper {
    return new StdHttpMethodWrapper(this.#method)
  }

  freeze(): this {
    this.isFrozen ||= true

    return this
  }

  get(): HttpMethod {
    return this.#method
  }

  set(method: HttpMethod): this {
    this.sureNotFrozen('set')

    this.#method = method

    return this
  }

  is(arg: HttpMethod | HttpMethod[]): boolean {
    const methods = Array.isArray(arg) ? arg : [arg]
    return methods.includes(this.#method)
  }

  protected sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Method frozen on ${name}`)
    }
  }
}

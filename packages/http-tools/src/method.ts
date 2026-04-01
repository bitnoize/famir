import { arrayIncludes, HTTP_METHODS, HttpMethod } from '@famir/common'

/*
 * HTTP method wrapper
 */
export class HttpMethodWrap {
  /*
   * Create wrapper from scratch
   */
  static fromScratch(): HttpMethodWrap {
    return new HttpMethodWrap('GET')
  }

  /*
   * Create wrapper from req object
   */
  static fromReq(req: { method?: string | undefined }): HttpMethodWrap {
    if (req.method == null) {
      throw new Error(`Method not defined`)
    }

    return HttpMethodWrap.fromString(req.method)
  }

  /*
   * Create wrapper from string
   */
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

  /*
   * Clone wrapper
   */
  clone(): HttpMethodWrap {
    return new HttpMethodWrap(this.#method)
  }

  #isFrozen: boolean = false

  /*
   * Wrapper frozen state
   */
  get isFrozen(): boolean {
    return this.#isFrozen
  }

  /*
   * Freeze wrapper
   */
  freeze(): this {
    this.#isFrozen = true

    return this
  }

  /*
   * Get method
   */
  get(): HttpMethod {
    return this.#method
  }

  /*
   * Set method value
   */
  set(method: HttpMethod) {
    this.sureNotFrozen('set')

    this.#method = method

    return this
  }

  /*
   * Check method
   */
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

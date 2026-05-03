import { arrayIncludes } from '@famir/common'
import { HTTP_METHODS, HttpMethod } from '@famir/http-proto'

/**
 * Wrapper for HTTP message method.
 *
 * @category none
 */
export class HttpMethodWrap {
  /**
   * Factory method to create wrapper from scratch.
   *
   * @returns New wrapper instance
   */
  static fromScratch(): HttpMethodWrap {
    return new HttpMethodWrap('GET')
  }

  /**
   * Factory method to create wrapper from request-like object.
   *
   * @param req - Object with optional method property
   * @returns New wrapper instance
   * @throws If req.method is not defined
   */
  static fromReq(req: { method?: string | undefined }): HttpMethodWrap {
    if (req.method == null) {
      throw new Error(`Method not defined`)
    }

    return HttpMethodWrap.fromString(req.method)
  }

  /**
   * Factory method to create wrapper from string value.
   *
   * @param value - Method string
   * @returns New wrapper instance
   * @throws If method is not supported
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

  /**
   * Clone wrapper with a copy of the method.
   *
   * @returns New independent wrapper instance
   */
  clone(): HttpMethodWrap {
    return new HttpMethodWrap(this.#method)
  }

  #isFrozen: boolean = false

  /**
   * Check if wrapper is frozen (read-only).
   *
   * @returns true if wrapper is frozen, false otherwise
   */
  get isFrozen(): boolean {
    return this.#isFrozen
  }

  /**
   * Freeze wrapper to prevent modifications.
   *
   * @returns This wrapper for method chaining
   */
  freeze(): this {
    this.#isFrozen = true

    return this
  }

  /**
   * Get method value.
   *
   * @returns Method string
   */
  get(): HttpMethod {
    return this.#method
  }

  /**
   * Set method value.
   *
   * @param method - Method to set
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  set(method: HttpMethod) {
    this.sureNotFrozen('set')

    this.#method = method

    return this
  }

  /**
   * Check if method matches the specified value(s).
   *
   * @param arg - Single method string or array of methods to check
   * @returns true if current method matches any of the provided methods
   */
  is(arg: HttpMethod | HttpMethod[]): boolean {
    const methods = Array.isArray(arg) ? arg : [arg]
    return methods.includes(this.#method)
  }

  private sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Method frozen on ${name}`)
    }
  }
}

import { arrayIncludes } from '@famir/common'
import { HTTP_METHODS, HttpMethod } from '@famir/http-proto'

/**
 * Wrapper class for HTTP message methods.
 */
export class HttpMethodWrap {
  /**
   * Factory method to create a wrapper from scratch.
   *
   * @returns A new wrapper instance with default method `GET`.
   */
  static fromScratch(): HttpMethodWrap {
    return new HttpMethodWrap('GET')
  }

  /**
   * Factory method to create a wrapper from a request-like object.
   *
   * @param req - The object with an optional `method` property.
   * @returns A new wrapper instance.
   * @throws Error If `req.method` is not defined or not supported.
   */
  static fromReq(req: { method?: string | undefined }): HttpMethodWrap {
    if (req.method == null) {
      throw new Error(`Method not defined`)
    }

    return HttpMethodWrap.fromString(req.method)
  }

  /**
   * Factory method to create a wrapper from a string value.
   *
   * @param value - The method string.
   * @returns A new wrapper instance.
   * @throws Error If the method is not supported.
   */
  static fromString(value: string): HttpMethodWrap {
    const normValue = value.toUpperCase()

    if (!arrayIncludes(HTTP_METHODS, normValue)) {
      throw new Error(`Method not known`)
    }

    return new HttpMethodWrap(normValue)
  }

  #method: HttpMethod

  /**
   * Creates a new wrapper instance.
   *
   * @param method - The HTTP method to wrap.
   */
  constructor(method: HttpMethod) {
    this.#method = method
  }

  /**
   * Clones the wrapper with a copy of the method.
   *
   * @returns A new independent wrapper instance.
   */
  clone(): HttpMethodWrap {
    return new HttpMethodWrap(this.#method)
  }

  #isFrozen: boolean = false

  /**
   * Checks if the wrapper is frozen (read-only).
   *
   * @returns `true` if the wrapper is frozen, `false` otherwise.
   */
  get isFrozen(): boolean {
    return this.#isFrozen
  }

  /**
   * Freezes the wrapper to prevent modifications.
   *
   * @returns This wrapper for method chaining.
   */
  freeze(): this {
    this.#isFrozen = true

    return this
  }

  /**
   * Gets the method value.
   *
   * @returns The HTTP method string.
   */
  get(): HttpMethod {
    return this.#method
  }

  /**
   * Sets the method value.
   *
   * @param method - The HTTP method to set.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   */
  set(method: HttpMethod): this {
    this.sureNotFrozen('set')

    this.#method = method

    return this
  }

  /**
   * Checks if the current method matches the specified value(s).
   *
   * @param arg - The single method string or an array of methods to check.
   * @returns `true` if the method matches any of the specified values, `false` otherwise.
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

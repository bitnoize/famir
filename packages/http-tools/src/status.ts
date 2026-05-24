/**
 * Wrapper class for HTTP message status codes.
 */
export class HttpStatusWrap {
  /**
   * Factory method to create a wrapper from scratch.
   *
   * @returns A new wrapper instance with default status `0`.
   */
  static fromScratch(): HttpStatusWrap {
    return new HttpStatusWrap(0)
  }

  #status: number

  /**
   * Creates a new wrapper instance.
   *
   * @param status - The status code to wrap.
   */
  constructor(status: number) {
    this.#status = status
  }

  /**
   * Clones the wrapper with a copy of the status.
   *
   * @returns A new independent wrapper instance.
   */
  clone(): HttpStatusWrap {
    return new HttpStatusWrap(this.#status)
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
   * Gets the status value.
   *
   * @returns The status code.
   */
  get(): number {
    return this.#status
  }

  /**
   * Sets the status value.
   *
   * @param status - The status code to set.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   */
  set(status: number): this {
    this.sureNotFrozen('set')

    this.#status = status

    return this
  }

  /**
   * Checks if the status is in the information range (100-199).
   *
   * @returns `true` if the status is in the range, `false` otherwise.
   */
  isInformation(): boolean {
    return this.between(100, 200)
  }

  /**
   * Checks if the status is in the success range (200-299).
   *
   * @returns `true` if the status is in the range, `false` otherwise.
   */
  isSuccess(): boolean {
    return this.between(200, 300)
  }

  /**
   * Checks if the status is in the redirect range (300-399).
   *
   * @returns `true` if the status is in the range, `false` otherwise.
   */
  isRedirect(): boolean {
    return this.between(300, 400)
  }

  /**
   * Checks if the status is in the client error range (400-499).
   *
   * @returns `true` if the status is in the range, `false` otherwise.
   */
  isClientError(): boolean {
    return this.between(400, 500)
  }

  /**
   * Checks if the status is in the server error range (500-599).
   *
   * @returns `true` if the status is in the range, `false` otherwise.
   */
  isServerError(): boolean {
    return this.between(500, 600)
  }

  /**
   * Checks if the status is not in the valid range (100-599).
   *
   * @returns `true` if the status is outside the valid range, `false` otherwise.
   */
  isUnknown(): boolean {
    return !this.between(100, 600)
  }

  /**
   * Resets the status to the default value `0`.
   *
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   */
  reset(): this {
    this.sureNotFrozen('reset')

    this.#status = 0

    return this
  }

  private sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Status frozen on ${name}`)
    }
  }

  private between(min: number, max: number): boolean {
    return this.#status >= min && this.#status < max
  }
}

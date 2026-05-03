/**
 * Wrapper for HTTP message status.
 *
 * @category none
 */
export class HttpStatusWrap {
  /**
   * Factory method to create wrapper from scratch.
   *
   * @returns New wrapper instance
   */
  static fromScratch(): HttpStatusWrap {
    return new HttpStatusWrap(0)
  }

  #status: number

  constructor(status: number) {
    this.#status = status
  }

  /**
   * Clone wrapper with a copy of the status.
   *
   * @returns New independent wrapper instance
   */
  clone(): HttpStatusWrap {
    return new HttpStatusWrap(this.#status)
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
   * Get status value.
   *
   * @returns Status value
   */
  get(): number {
    return this.#status
  }

  /**
   * Set status value.
   *
   * @param status - Status value to set
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  set(status: number): this {
    this.sureNotFrozen('set')

    this.#status = status

    return this
  }

  /**
   * Check status is in range 100-199.
   *
   * @returns true if wrapper is in range, false otherwise
   */
  isInformation(): boolean {
    return this.between(100, 200)
  }

  /**
   * Check status is in range 200-299.
   *
   * @returns true if status is in range, false otherwise
   */
  isSuccess(): boolean {
    return this.between(200, 300)
  }

  /**
   * Check status is in range 300-399.
   *
   * @returns true if status is in range, false otherwise
   */
  isRedirect(): boolean {
    return this.between(300, 400)
  }

  /**
   * Check status is in range 400-499.
   *
   * @returns true if status is in range, false otherwise
   */
  isClientError(): boolean {
    return this.between(400, 500)
  }

  /**
   * Check status is in range 500-599.
   *
   * @returns true if status is in range, false otherwise
   */
  isServerError(): boolean {
    return this.between(500, 600)
  }

  /**
   * Check status is not in 100-599 range.
   *
   * @returns true if status is in valid range, false otherwise
   */
  isUnknown(): boolean {
    return !this.between(100, 600)
  }

  /**
   * Clear status and reset to default.
   *
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
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

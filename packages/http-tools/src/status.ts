/*
 * HTTP status wrapper
 */
export class HttpStatusWrap {
  /*
   * Create wrapper from scratch
   */
  static fromScratch(): HttpStatusWrap {
    return new HttpStatusWrap(0)
  }

  #status: number

  constructor(status: number) {
    this.#status = status
  }

  /*
   * Clone wrapper
   */
  clone(): HttpStatusWrap {
    return new HttpStatusWrap(this.#status)
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
   * Get status value
   */
  get(): number {
    return this.#status
  }

  /*
   * Set status value
   */
  set(status: number): this {
    this.sureNotFrozen('set')

    this.#status = status

    return this
  }

  /*
   * Check status in range 100-199
   */
  isInformation(): boolean {
    return this.between(100, 200)
  }

  /*
   * Check status in range 200-299
   */
  isSuccess(): boolean {
    return this.between(200, 300)
  }

  /*
   * Check status in range 300-399
   */
  isRedirect(): boolean {
    return this.between(300, 400)
  }

  /*
   * Check status in range 400-499
   */
  isClientError(): boolean {
    return this.between(400, 500)
  }

  /*
   * Check status in range 500-599
   */
  isServerError(): boolean {
    return this.between(500, 600)
  }

  /*
   * Check status is not in valid range
   */
  isUnknown(): boolean {
    return !this.between(100, 600)
  }

  /*
   * Cleanup wrapper
   */
  reset(): this {
    this.sureNotFrozen('reset')

    this.#status = 0

    return this
  }

  protected sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Status frozen on ${name}`)
    }
  }

  protected between(min: number, max: number): boolean {
    return this.#status >= min && this.#status < max
  }
}

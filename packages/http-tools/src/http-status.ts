import { HttpStatusWrapper } from '@famir/domain'

export class StdHttpStatusWrapper implements HttpStatusWrapper {
  static fromScratch(): HttpStatusWrapper {
    return new StdHttpStatusWrapper(0)
  }

  #status: number
  protected isFrozen: boolean = false

  constructor(status: number) {
    this.#status = status
  }

  clone(): HttpStatusWrapper {
    return new StdHttpStatusWrapper(this.#status)
  }

  freeze(): this {
    this.isFrozen ||= true

    return this
  }

  get(): number {
    return this.#status
  }

  set(status: number): this {
    this.sureNotFrozen('set')

    this.#status = status

    return this
  }

  isInformation(): boolean {
    return this.between(100, 200)
  }

  isSuccess(): boolean {
    return this.between(200, 300)
  }

  isRedirect(): boolean {
    return this.between(300, 400)
  }

  isClientError(): boolean {
    return this.between(400, 500)
  }

  isServerError(): boolean {
    return this.between(500, 600)
  }

  isUnknown(): boolean {
    return !this.between(100, 600)
  }

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

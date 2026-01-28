import { HttpStatusWrapper } from '@famir/domain'

export class StdHttpStatusWrapper implements HttpStatusWrapper {
  #status: number = 0

  protected isFrozen: boolean = false

  freeze(): this {
    if (!this.isFrozen) {
      this.isFrozen = true
    }

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
    return this.isStatusRange(100, 200)
  }

  isSuccess(): boolean {
    return this.isStatusRange(200, 300)
  }

  isRedirect(): boolean {
    return this.isStatusRange(300, 400)
  }

  isClientError(): boolean {
    return this.isStatusRange(400, 500)
  }

  isServerError(): boolean {
    return this.isStatusRange( 500, 600)
  }

  isUnknown(): boolean {
    return !this.isStatusRange(100, 600)
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

  protected isStatusRange(min: number, max: number): boolean {
    return this.#status >= min && this.#status < max
  }
}

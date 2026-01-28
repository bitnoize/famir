import { HttpBody, HttpBodyWrapper, HttpQueryString } from '@famir/domain'
import qs from 'qs'

export class StdHttpBodyWrapper implements HttpBodyWrapper {
  #body: HttpBody = Buffer.alloc(0)

  protected isFrozen: boolean = false

  freeze(): this {
    if (!this.isFrozen) {
      this.isFrozen = true
    }

    return this
  }

  get(): HttpBody {
    return this.#body
  }

  set(body: HttpBody): this {
    this.sureNotFrozen('set')

    this.#body = body

    return this
  }

  getString(encoding?: BufferEncoding): string {
    return this.#body.toString(encoding)
  }

  setString(value: string, encoding?: BufferEncoding): this {
    this.sureNotFrozen('setString')

    this.#body = Buffer.from(value, encoding)

    return this
  }

  getJson(encoding?: BufferEncoding): unknown {
    const value = this.getString(encoding)
    return JSON.parse(value)
  }

  setJson(json: object, encoding?: BufferEncoding): this {
    this.sureNotFrozen('setJson')

    const value = JSON.stringify(json)
    this.setString(value, encoding)

    return this
  }

  getQueryString(encoding?: BufferEncoding): HttpQueryString {
    const value = this.getString(encoding)
    return qs.parse(value, {})
  }

  setQueryString(queryString: HttpQueryString, encoding?: BufferEncoding): this {
    this.sureNotFrozen('setQueryString')

    const value = qs.stringify(queryString, {})
    this.setString(value, encoding)

    return this
  }

  reset(): this {
    this.sureNotFrozen('reset')

    this.#body = Buffer.alloc(0)

    return this
  }

  protected sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Body frozen on ${name}`)
    }
  }
}

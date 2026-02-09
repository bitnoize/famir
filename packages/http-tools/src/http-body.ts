import {
  HttpBody,
  HttpBodyWrapper,
  HttpContentType,
  HttpFormatQueryStringOptions,
  HttpJson,
  HttpParseQueryStringOptions,
  HttpQueryString,
  HttpText
} from '@famir/domain'
import * as iconv from 'iconv-lite'
import qs from 'qs'

export class StdHttpBodyWrapper implements HttpBodyWrapper {
  static fromScratch(): HttpBodyWrapper {
    return new StdHttpBodyWrapper(Buffer.alloc(0))
  }

  #body: HttpBody
  protected isFrozen: boolean = false

  constructor(body: HttpBody) {
    this.#body = body
  }

  clone(): HttpBodyWrapper {
    return new StdHttpBodyWrapper(Buffer.from(this.#body))
  }

  freeze(): this {
    this.isFrozen ||= true

    return this
  }

  get size(): number {
    return this.#body.length
  }

  get(): HttpBody {
    return this.#body
  }

  set(body: HttpBody): this {
    this.sureNotFrozen('set')

    this.invalidateCacheAll()

    this.#body = body

    return this
  }

  getBase64(): string {
    return this.#body.toString('base64')
  }

  setBase64(value: string): this {
    this.#body = Buffer.from(value, 'base64')

    return this
  }

  #cacheText: string | null = null

  getText(charset: string = 'utf8'): HttpText {
    if (this.#cacheText != null) {
      return this.#cacheText
    }

    const text = iconv.decode(this.#body, charset)

    this.#cacheText = text

    return text
  }

  setText(text: HttpText, charset: string = 'utf8'): this {
    this.sureNotFrozen('setText')

    this.#body = iconv.encode(text, charset)

    this.#cacheText = text

    return this
  }

  #cacheJson: HttpJson | null = null

  getJson(charset?: string): HttpJson {
    if (this.#cacheJson != null) {
      return this.#cacheJson
    }

    const text = this.getText(charset)
    const json: unknown = JSON.parse(text)

    if (json == null) {
      throw new Error(`Body wrong json value`)
    }

    this.#cacheJson = json

    return json
  }

  setJson(json: HttpJson, charset?: string): this {
    this.sureNotFrozen('setJson')

    const text = JSON.stringify(json)
    this.setText(text, charset)

    this.#cacheJson = json

    return this
  }

  readonly parseQueryStringOptions: HttpParseQueryStringOptions = {}
  readonly formatQueryStringOptions: HttpFormatQueryStringOptions = {}

  #cacheQueryString: HttpQueryString | null = null

  getQueryString(charset?: string): HttpQueryString {
    if (this.#cacheQueryString != null) {
      return this.#cacheQueryString
    }

    const text = this.getText(charset)
    const queryString = qs.parse(text, {
      ...this.parseQueryStringOptions,
      ignoreQueryPrefix: true
    })

    this.#cacheQueryString = queryString

    return queryString
  }

  setQueryString(queryString: HttpQueryString, charset?: string): this {
    this.sureNotFrozen('setQueryString')

    const text = qs.stringify(queryString, {
      ...this.formatQueryStringOptions,
      addQueryPrefix: true
    })
    this.setText(text, charset)

    this.#cacheQueryString = queryString

    return this
  }

  reset(): this {
    this.sureNotFrozen('reset')

    this.invalidateCacheAll()

    this.set(Buffer.alloc(0))

    return this
  }

  protected sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Body frozen on ${name}`)
    }
  }

  protected invalidateCacheAll() {
    this.#cacheText = null
    this.#cacheJson = null
    this.#cacheQueryString = null
  }
}

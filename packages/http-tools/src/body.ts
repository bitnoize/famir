import { HttpBody, HttpJson, HttpQueryString, HttpText } from '@famir/http-proto'
import * as iconv from 'iconv-lite'
import {
  formatQueryString,
  HttpFormatQueryStringOptions,
  HttpParseQueryStringOptions,
  parseQueryString,
} from './query-string.js'

/**
 * Represents a HTTP body wrapper
 *
 * @category none
 */
export class HttpBodyWrap {
  /**
   * Create wrapper from scratch
   */
  static fromScratch(): HttpBodyWrap {
    return new HttpBodyWrap(Buffer.alloc(0))
  }

  #body: HttpBody

  constructor(body: HttpBody) {
    this.#body = body
  }

  /**
   * Clone wrapper
   */
  clone(): HttpBodyWrap {
    return new HttpBodyWrap(Buffer.from(this.#body))
  }

  #isFrozen: boolean = false

  /**
   * Wrapper frozen state
   */
  get isFrozen(): boolean {
    return this.#isFrozen
  }

  /**
   * Freeze wrapper
   */
  freeze(): this {
    this.#isFrozen = true

    return this
  }

  /**
   * Body size
   */
  get length(): number {
    return this.#body.length
  }

  /**
   * Get body
   */
  get(): HttpBody {
    return this.#body
  }

  /**
   * Set body
   */
  set(body: HttpBody): this {
    this.sureNotFrozen('set')

    this.invalidateCacheAll()

    this.#body = body

    return this
  }

  #cacheBase64: string | null = null

  /**
   * Get base64 body
   */
  getBase64(): string {
    if (this.#cacheBase64 != null) {
      return this.#cacheBase64
    }

    const base64 = this.get().toString('base64')

    this.#cacheBase64 = base64

    return base64
  }

  /**
   * Set base64 body
   */
  setBase64(base64: string): this {
    this.sureNotFrozen('setBase64')

    this.set(Buffer.from(base64, 'base64'))

    this.#cacheBase64 = base64

    return this
  }

  #cacheText: string | null = null

  /**
   * Get text body
   */
  getText(charset: string = 'utf8'): HttpText {
    if (this.#cacheText != null) {
      return this.#cacheText
    }

    const text = iconv.decode(this.get(), charset)

    this.#cacheText = text

    return text
  }

  /**
   * Set text body
   */
  setText(text: HttpText, charset: string = 'utf8'): this {
    this.sureNotFrozen('setText')

    this.set(iconv.encode(text, charset))

    this.#cacheText = text

    return this
  }

  #cacheJson: HttpJson | null = null

  /**
   * Get json body
   */
  getJson(charset?: string): HttpJson {
    if (this.#cacheJson != null) {
      return this.#cacheJson
    }

    const text = this.getText(charset)
    const json: unknown = JSON.parse(text)

    if (json == null) {
      throw new Error(`Body wrong json`)
    }

    this.#cacheJson = json

    return json
  }

  /**
   * Set json body
   */
  setJson(json: HttpJson, charset?: string): this {
    this.sureNotFrozen('setJson')

    const text = JSON.stringify(json)
    this.setText(text, charset)

    this.#cacheJson = json

    return this
  }

  /**
   * Custom parse query-string options
   */
  readonly parseQueryStringOptions: HttpParseQueryStringOptions = {}

  /**
   * Custom format query-string options
   */
  readonly formatQueryStringOptions: HttpFormatQueryStringOptions = {}

  #cacheQueryString: HttpQueryString | null = null

  /**
   * Get query-string body
   */
  getQueryString(charset?: string): HttpQueryString {
    if (this.#cacheQueryString != null) {
      return this.#cacheQueryString
    }

    const text = this.getText(charset)
    const queryString = parseQueryString(text, {
      ...this.parseQueryStringOptions,
      ignoreQueryPrefix: true,
    })

    this.#cacheQueryString = queryString

    return queryString
  }

  /**
   * Set query-string body
   */
  setQueryString(queryString: HttpQueryString, charset?: string): this {
    this.sureNotFrozen('setQueryString')

    const text = formatQueryString(queryString, {
      ...this.formatQueryStringOptions,
      addQueryPrefix: true,
    })
    this.setText(text, charset)

    this.#cacheQueryString = queryString

    return this
  }

  /**
   * Cleanup wrapper
   */
  reset(): this {
    this.sureNotFrozen('reset')

    this.invalidateCacheAll()

    this.set(Buffer.alloc(0))

    return this
  }

  private sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Body frozen on ${name}`)
    }
  }

  private invalidateCacheAll() {
    this.#cacheBase64 = null
    this.#cacheText = null
    this.#cacheJson = null
    this.#cacheQueryString = null
  }
}

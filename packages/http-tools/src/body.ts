import { HttpBody, HttpJson, HttpQueryString, HttpText } from '@famir/http-proto'
import * as iconv from 'iconv-lite'
import {
  formatQueryString,
  FormatQueryStringOptions,
  parseQueryString,
  ParseQueryStringOptions,
} from './query-string.js'

/**
 * Wrapper class for HTTP message bodies.
 */
export class HttpBodyWrap {
  /**
   * Factory method to create a wrapper from scratch.
   *
   * @returns A new wrapper instance with an empty body.
   */
  static fromScratch(): HttpBodyWrap {
    return new HttpBodyWrap(Buffer.alloc(0))
  }

  #body: HttpBody

  /**
   * Creates a new wrapper instance.
   *
   * @param body - The body buffer to wrap.
   */
  constructor(body: HttpBody) {
    this.#body = body
  }

  /**
   * Clones the wrapper with a copy of the body.
   *
   * @returns A new independent wrapper instance.
   */
  clone(): HttpBodyWrap {
    return new HttpBodyWrap(Buffer.from(this.#body))
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
   * Gets the body buffer size in bytes.
   *
   * @returns The size of the body.
   */
  get length(): number {
    return this.#body.length
  }

  /**
   * Gets the raw body buffer.
   *
   * @returns The Buffer containing the body.
   */
  get(): HttpBody {
    return this.#body
  }

  /**
   * Sets the raw body buffer.
   *
   * @param body - The Buffer to set as the body.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   */
  set(body: HttpBody): this {
    this.sureNotFrozen('set')

    this.invalidateCacheAll()

    this.#body = body

    return this
  }

  #cacheBase64: string | null = null

  /**
   * Gets the body as a Base64 string (cached).
   *
   * @returns The Base64 encoded body.
   * @throws Error If Base64 encoding fails.
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
   * Sets the body from a Base64 string.
   *
   * @param base64 - The Base64 encoded string.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   * @throws Error If Base64 decoding fails.
   */
  setBase64(base64: string): this {
    this.sureNotFrozen('setBase64')

    this.set(Buffer.from(base64, 'base64'))

    this.#cacheBase64 = base64

    return this
  }

  #cacheText: string | null = null

  /**
   * Gets the body as a text string (cached).
   *
   * @param charset - The character encoding, default: 'utf8'.
   * @returns The decoded text.
   * @throws Error If decoding fails.
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
   * Sets the body from a text string.
   *
   * @param text - The text to set as the body.
   * @param charset - The character encoding, default: 'utf8'.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   * @throws Error If encoding fails.
   */
  setText(text: HttpText, charset: string = 'utf8'): this {
    this.sureNotFrozen('setText')

    this.set(iconv.encode(text, charset))

    this.#cacheText = text

    return this
  }

  #cacheJson: HttpJson | null = null

  /**
   * Gets the body as a JSON object (cached).
   *
   * @param charset - The optional character encoding.
   * @returns The parsed JSON object.
   * @throws Error If decoding or JSON parsing fails.
   */
  getJson(charset?: string): HttpJson {
    if (this.#cacheJson != null) {
      return this.#cacheJson
    }

    const text = this.getText(charset)
    const json: unknown = JSON.parse(text)

    if (!(typeof json === 'object' && json != null)) {
      throw new Error(`Invalid JSON in body`)
    }

    this.#cacheJson = json

    return json
  }

  /**
   * Sets the body from a JSON object.
   *
   * @param json - The JSON object to stringify.
   * @param charset - The optional character encoding.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   * @throws Error If JSON stringification or encoding fails.
   */
  setJson(json: HttpJson, charset?: string): this {
    this.sureNotFrozen('setJson')

    const text = JSON.stringify(json)
    this.setText(text, charset)

    this.#cacheJson = json

    return this
  }

  /** Custom options for parsing query strings. */
  readonly parseQueryStringOptions: ParseQueryStringOptions = {}

  /** Custom options for formatting query strings. */
  readonly formatQueryStringOptions: FormatQueryStringOptions = {}

  #cacheQueryString: HttpQueryString | null = null

  /**
   * Gets the body as a query string object (cached).
   *
   * @param charset - The optional character encoding.
   * @returns The parsed query string object.
   * @throws Error If parsing fails.
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
   * Sets the body from a query string object.
   *
   * @param queryString - The query string object.
   * @param charset - The optional character encoding.
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
   * @throws Error If formatting fails.
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
   * Clears the body and resets all caches.
   *
   * @returns This wrapper for method chaining.
   * @throws Error If the wrapper is frozen.
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

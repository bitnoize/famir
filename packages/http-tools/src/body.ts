import { HttpBody, HttpJson, HttpQueryString, HttpText } from '@famir/http-proto'
import * as iconv from 'iconv-lite'
import {
  formatQueryString,
  FormatQueryStringOptions,
  parseQueryString,
  ParseQueryStringOptions,
} from './query-string.js'

/**
 * Wrapper for HTTP message body.
 *
 * @category none
 */
export class HttpBodyWrap {
  /**
   * Factory method to create wrapper from scratch.
   *
   * @returns New wrapper instance
   */
  static fromScratch(): HttpBodyWrap {
    return new HttpBodyWrap(Buffer.alloc(0))
  }

  #body: HttpBody

  constructor(body: HttpBody) {
    this.#body = body
  }

  /**
   * Clone wrapper with a copy of the body.
   *
   * @returns New independent wrapper instance
   */
  clone(): HttpBodyWrap {
    return new HttpBodyWrap(Buffer.from(this.#body))
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
   * Get body buffer size in bytes.
   *
   * @returns Size of the body
   */
  get length(): number {
    return this.#body.length
  }

  /**
   * Get raw body buffer.
   *
   * @returns Buffer containing the body
   */
  get(): HttpBody {
    return this.#body
  }

  /**
   * Set raw body buffer.
   *
   * @param body - Buffer to set as body
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  set(body: HttpBody): this {
    this.sureNotFrozen('set')

    this.invalidateCacheAll()

    this.#body = body

    return this
  }

  #cacheBase64: string | null = null

  /**
   * Get body as base64 string (cached).
   *
   * @returns Base64 encoded body
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
   * Set body from base64 string.
   *
   * @param base64 - Base64 encoded string
   * @returns This wrapper for method chaining
   * @throws If invalid base64 format or wrapper is frozen
   */
  setBase64(base64: string): this {
    this.sureNotFrozen('setBase64')

    this.set(Buffer.from(base64, 'base64'))

    this.#cacheBase64 = base64

    return this
  }

  #cacheText: string | null = null

  /**
   * Get body as text string (cached).
   *
   * @param charset - Character encoding (default: 'utf8').
   * @returns Decoded text
   * @throws If charset is not supported by iconv-lite
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
   * Set body from text string.
   *
   * @param text - Text to set as body
   * @param charset - Character encoding (default: 'utf8')
   * @returns This wrapper for method chaining
   * @throws If charset is not supported or wrapper is frozen
   */
  setText(text: HttpText, charset: string = 'utf8'): this {
    this.sureNotFrozen('setText')

    this.set(iconv.encode(text, charset))

    this.#cacheText = text

    return this
  }

  #cacheJson: HttpJson | null = null

  /**
   * Get body as JSON object (cached).
   *
   * @param charset - Character encoding for decoding (optional)
   * @returns Parsed JSON object
   * @throws If body is not valid JSON
   */
  getJson(charset?: string): HttpJson {
    if (this.#cacheJson != null) {
      return this.#cacheJson
    }

    const text = this.getText(charset)
    const json: unknown = JSON.parse(text)

    if (json == null) {
      throw new Error(`Invalid JSON in body`)
    }

    this.#cacheJson = json

    return json
  }

  /**
   * Set body from JSON object.
   *
   * @param json - JSON object to stringify
   * @param charset - Character encoding (optional)
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
   */
  setJson(json: HttpJson, charset?: string): this {
    this.sureNotFrozen('setJson')

    const text = JSON.stringify(json)
    this.setText(text, charset)

    this.#cacheJson = json

    return this
  }

  /**
   * Custom options for parsing query strings.
   */
  readonly parseQueryStringOptions: ParseQueryStringOptions = {}

  /**
   * Custom options for formatting query strings.
   */
  readonly formatQueryStringOptions: FormatQueryStringOptions = {}

  #cacheQueryString: HttpQueryString | null = null

  /**
   * Get body as query string object (cached).
   *
   * @param charset - Character encoding for decoding (optional)
   * @returns Parsed query string as object
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
   * Set body from query string object.
   *
   * @param queryString - Query string object
   * @param charset - Character encoding (optional)
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
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
   * Clear body and reset all caches.
   *
   * @returns This wrapper for method chaining
   * @throws If wrapper is frozen
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

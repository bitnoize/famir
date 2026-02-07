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

  get(): HttpBody {
    return this.#body
  }

  set(body: HttpBody): this {
    this.sureNotFrozen('set')

    this.invalidateCacheAll()

    this.#body = body

    return this
  }

  get size(): number {
    return this.#body.length
  }

  #cacheText: string | null = null

  getText(contentType: HttpContentType): HttpText {
    if (this.#cacheText != null) {
      return this.#cacheText
    }

    const charset = this.normalizeCharset(contentType)
    const text = iconv.decode(this.#body, charset)

    this.#cacheText = text

    return text
  }

  setText(text: HttpText, contentType: HttpContentType): this {
    this.sureNotFrozen('setText')

    const charset = this.normalizeCharset(contentType)
    this.#body = iconv.encode(text, charset)

    this.#cacheText = text

    return this
  }

  #cacheJson: HttpJson | null = null

  getJson(contentType: HttpContentType): HttpJson {
    if (this.#cacheJson != null) {
      return this.#cacheJson
    }

    const text = this.getText(contentType)
    const json: unknown = JSON.parse(text)

    if (json == null) {
      throw new Error(`Body wrong json value`)
    }

    this.#cacheJson = json

    return json
  }

  setJson(json: HttpJson, contentType: HttpContentType): this {
    this.sureNotFrozen('setJson')

    const text = JSON.stringify(json)
    this.setText(text, contentType)

    this.#cacheJson = json

    return this
  }

  readonly parseQueryStringOptions: HttpParseQueryStringOptions = {}
  readonly formatQueryStringOptions: HttpFormatQueryStringOptions = {}

  #cacheQueryString: HttpQueryString | null = null

  getQueryString(contentType: HttpContentType): HttpQueryString {
    if (this.#cacheQueryString != null) {
      return this.#cacheQueryString
    }

    const text = this.getText(contentType)
    const queryString = qs.parse(text, {
      ...this.parseQueryStringOptions,
      ignoreQueryPrefix: true
    })

    this.#cacheQueryString = queryString

    return queryString
  }

  setQueryString(queryString: HttpQueryString, contentType: HttpContentType): this {
    this.sureNotFrozen('setQueryString')

    const text = qs.stringify(queryString, {
      ...this.formatQueryStringOptions,
      addQueryPrefix: true
    })
    this.setText(text, contentType)

    this.#cacheQueryString = queryString

    return this
  }

  reset(): this {
    this.sureNotFrozen('reset')

    this.invalidateCacheAll()

    this.set(Buffer.alloc(0))

    return this
  }

  toBuffer(): Buffer {
    return Buffer.from(this.#body)
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

  protected normalizeCharset(contentType: HttpContentType): string {
    const charset = contentType.parameters['charset'] || 'utf8'

    if (!iconv.encodingExists(charset)) {
      throw new Error(`Body wrong charset`)
    }

    return charset
  }
}

import { arrayIncludes, randomIdent, serializeError } from '@famir/common'
import {
  HTTP_TYPES_NORMAL,
  HTTP_TYPES_WEBSOCKET,
  HttpConnection,
  HttpContentType,
  HttpError,
  HttpPayload,
  HttpType,
} from '@famir/http-proto'
import { Transform } from 'node:stream'
import { HttpBodyWrap } from './body.js'
import { HttpContentTypeName, HttpContentTypes } from './content-type.js'
import { HttpHeadersWrap } from './headers.js'
import { HttpMethodWrap } from './method.js'
import { RewriteUrlScheme, RewriteUrlTarget, rewriteUrl } from './rewrite-url.js'
import { HttpStatusWrap } from './status.js'
import { HttpUrlWrap } from './url.js'

/**
 * Interceptor function type for HTTP message processing.
 *
 * @category none
 */
export type HttpMessageInterceptor = (message: HttpMessage) => void

/**
 * @category none
 * @internal
 */
export type HttpMessageInterceptors = Array<[string, HttpMessageInterceptor]>

/**
 * Complete HTTP message representation with request/response components.
 *
 * @category none
 */
export class HttpMessage {
  /**
   * Factory method to create message by type.
   *
   * @param type - Message type ('normal' or 'websocket')
   * @returns New message instance
   * @throws Error if message type is unknown
   */
  static create(type: string): HttpMessage {
    if (type === 'normal') {
      return new HttpMessage('normal-simple')
    } else if (type === 'websocket') {
      return new HttpMessage('websocket')
    } else {
      throw new Error(`Message type not known: ${type}`)
    }
  }

  #type: HttpType

  readonly method: HttpMethodWrap
  readonly url: HttpUrlWrap
  readonly requestHeaders: HttpHeadersWrap
  readonly requestBody: HttpBodyWrap
  readonly status: HttpStatusWrap
  readonly responseHeaders: HttpHeadersWrap
  readonly responseBody: HttpBodyWrap

  readonly id = randomIdent()

  constructor(type: HttpType) {
    this.#type = type

    this.method = HttpMethodWrap.fromScratch()
    this.url = HttpUrlWrap.fromScratch()
    this.requestHeaders = HttpHeadersWrap.fromScratch()
    this.requestBody = HttpBodyWrap.fromScratch()
    this.status = HttpStatusWrap.fromScratch()
    this.responseHeaders = HttpHeadersWrap.fromScratch()
    this.responseBody = HttpBodyWrap.fromScratch()
  }

  #isReady: boolean = false

  /**
   * Check if message is ready for processing.
   *
   * @returns true if message is ready, false otherwise
   */
  get isReady(): boolean {
    return this.#isReady
  }

  /**
   * Mark message as ready for processing.
   */
  ready() {
    this.#isReady = true
  }

  /**
   * Get message type.
   *
   * @returns Current message type
   */
  get type(): HttpType {
    return this.#type
  }

  /**
   * Set message type with validation.
   *
   * @param type - New message type
   * @throws Error if message is ready or invalid type transition
   */
  setType(type: HttpType) {
    this.sureNotReady('setType')

    if (!arrayIncludes(this.typesSwitch[this.type], type)) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Wrong type switch: ${this.type} => ${type}`)
    }

    this.#type = type
  }

  /**
   * Connection metadata.
   */
  readonly connection: HttpConnection = {}

  /**
   * Merge connection metadata.
   *
   * @param connection - Connection data to merge
   */
  mergeConnection(connection: HttpConnection) {
    Object.entries(connection).forEach(([name, value]) => {
      if (value != null) {
        this.connection[name] = value
      }
    })
  }

  /**
   * Message payload data.
   */
  readonly payload: HttpPayload = {}

  /**
   * Accumulated errors during processing.
   */
  readonly errors: HttpError[] = []

  /**
   * Add error with path context.
   *
   * @param error - Error object or unknown value
   * @param path - Error location path segments
   */
  addError(error: unknown, ...path: string[]) {
    this.errors.push([serializeError(error), ...path])
  }

  /**
   * Analysis result string.
   */
  analyze: string | null = null
  /////////////

  #contentTypes: HttpContentTypes = {
    text: [],
    html: [],
    css: [],
    javascript: [],
    json: [],
    xml: [],
    urlEncoded: [],
  }

  /**
   * Register content-types for a category.
   *
   * @param name - Content type category
   * @param types - Array of MIME types
   * @throws Error if message is ready
   */
  addContentTypes(name: HttpContentTypeName, types: string[]) {
    this.sureNotReady('addContentTypes')

    this.#contentTypes[name].push(...types)
  }

  /**
   * Check if content-type belongs to category.
   *
   * @param name - Content type category
   * @param contentType - Parsed content-type to check
   * @returns true if content-type matches category, false otherwise
   */
  isContentType(name: HttpContentTypeName, contentType: HttpContentType): boolean {
    return this.#contentTypes[name].includes(contentType.type)
  }

  #rewriteUrlContentTypes: string[] = []

  /**
   * Add content-types eligible for URL rewriting.
   *
   * @param types - Array of MIME types
   * @throws Error if message is ready
   */
  addRewriteUrlContentTypes(types: string[]) {
    this.sureNotReady('addRewriteUrlContentTypes')

    this.#rewriteUrlContentTypes.push(...types)
  }

  /**
   * Check if content-type supports URL rewriting.
   *
   * @param contentType - Parsed content-type to check
   * @returns true if rewriting is applicable, false otherwise
   */
  isRewriteUrlContentType(contentType: HttpContentType): boolean {
    return this.#rewriteUrlContentTypes.includes(contentType.type)
  }

  #rewriteUrlSchemes: RewriteUrlScheme[] = [
    ['://', true],
    ['//', false],
  ]

  /**
   * Add extra URL rewriting schemes (percent and unicode encoded).
   *
   * @throws Error if message is ready
   */
  addRewriteUrlExtraSchemes() {
    this.sureNotReady('addRewriteUrlExtraSchemes')

    this.#rewriteUrlSchemes.push(
      ['%3A%2F%2F', true],
      ['%2F%2F', false],
      [':\\u002F\\u002F', true],
      ['\\u002F\\u002F', false]
    )
  }

  #requestHeadInterceptors: HttpMessageInterceptors = []
  #requestBodyInterceptors: HttpMessageInterceptors = []

  /**
   * Add request head interceptor.
   *
   * @param name - Interceptor identifier
   * @param interceptor - Interceptor function
   * @throws Error if message is ready
   */
  addRequestHeadInterceptor(name: string, interceptor: HttpMessageInterceptor) {
    this.sureNotReady('addRequestHeadInterceptor')

    this.#requestHeadInterceptors.push([name, interceptor])
  }

  /**
   * Add request body interceptor.
   *
   * @param name - Interceptor identifier
   * @param interceptor - Interceptor function
   * @throws Error if message is ready
   */
  addRequestBodyInterceptor(name: string, interceptor: HttpMessageInterceptor) {
    this.sureNotReady('addRequestBodyInterceptor')

    this.#requestBodyInterceptors.push([name, interceptor])
  }

  /**
   * Execute all request head interceptors.
   *
   * @throws Error if message is not ready
   */
  runRequestHeadInterceptors() {
    this.sureIsReady('runRequestHeadInterceptors')

    for (const [name, interceptor] of this.#requestHeadInterceptors) {
      try {
        interceptor(this)
      } catch (error) {
        this.addError(error, 'request-head-interceptor', name)
      }
    }

    this.method.freeze()
    this.url.freeze()
  }

  /**
   * Execute all request body interceptors.
   *
   * @throws Error if message is not ready
   */
  runRequestBodyInterceptors() {
    this.sureIsReady('runRequestBodyInterceptors')

    for (const [name, interceptor] of this.#requestBodyInterceptors) {
      try {
        interceptor(this)
      } catch (error) {
        this.addError(error, 'request-body-interceptor', name)
      }
    }

    this.requestHeaders.set('Content-Length', this.requestBody.length.toString())

    this.requestHeaders.freeze()
    this.requestBody.freeze()
  }

  #requestTransforms: Transform[] = []

  /**
   * Add stream transform for request body.
   *
   * @param transform - Node.js Transform stream
   * @throws Error if message is ready
   */
  addRequestTransform(transform: Transform) {
    this.sureNotReady('addRequestTransform')

    this.#requestTransforms.push(transform)
  }

  /**
   * Get request transforms.
   *
   * @returns Array of transforms
   */
  getRequestTransforms(): Transform[] {
    return this.#requestTransforms
  }

  #responseHeadInterceptors: HttpMessageInterceptors = []
  #responseBodyInterceptors: HttpMessageInterceptors = []

  /**
   * Add response head interceptor.
   *
   * @param name - Interceptor identifier
   * @param interceptor - Interceptor function
   * @throws Error if message is ready
   */
  addResponseHeadInterceptor(name: string, interceptor: HttpMessageInterceptor) {
    this.sureNotReady('addResponseHeadInterceptor')

    this.#responseHeadInterceptors.push([name, interceptor])
  }

  /**
   * Add response body interceptor.
   *
   * @param name - Interceptor identifier
   * @param interceptor - Interceptor function
   * @throws Error if message is ready
   */
  addResponseBodyInterceptor(name: string, interceptor: HttpMessageInterceptor) {
    this.sureNotReady('addResponseBodyInterceptor')

    this.#responseBodyInterceptors.push([name, interceptor])
  }

  /**
   * Execute all response head interceptors.
   *
   * @throws Error if message is not ready
   */
  runResponseHeadInterceptors() {
    this.sureIsReady('runResponseHeadInterceptors')

    for (const [name, interceptor] of this.#responseHeadInterceptors) {
      try {
        interceptor(this)
      } catch (error) {
        this.addError(error, 'response-head-interceptor', name)
      }
    }

    this.status.freeze()
  }

  /**
   * Execute all response body interceptors.
   *
   * @throws Error if message is not ready
   */
  runResponseBodyInterceptors() {
    this.sureIsReady('runResponseBodyInterceptors')

    for (const [name, interceptor] of this.#responseBodyInterceptors) {
      try {
        interceptor(this)
      } catch (error) {
        this.addError(error, 'response-body-interceptor', name)
      }
    }

    this.responseHeaders.set('Content-Length', this.responseBody.length.toString())

    this.responseHeaders.freeze()
    this.responseBody.freeze()
  }

  #responseTransforms: Transform[] = []

  /**
   * Add stream transform for response body.
   *
   * @param transform - Node.js Transform stream
   * @throws Error if message is ready
   */
  addResponseTransform(transform: Transform) {
    this.sureNotReady('addResponseTransform')

    this.#responseTransforms.push(transform)
  }

  /**
   * Get response transforms.
   *
   * @returns Array of transforms
   */
  getResponseTransforms(): Transform[] {
    return this.#responseTransforms
  }

  /**
   * Check if value is absolute URL.
   *
   * @param value - URL string to check
   * @returns true if absolute URL
   */
  isAbsoluteUrl(value: string): boolean {
    const regExp = /^https?:\/\/|^\/\//i
    return regExp.test(value)
  }

  /**
   * Rewrite URLs in text.
   *
   * @param text - Text content containing URLs
   * @param rev - Reverse rewriting (mirror to donor)
   * @param targets - URL rewrite targets
   * @returns Text with rewritten URLs
   */
  rewriteUrl(text: string, rev: boolean, targets: RewriteUrlTarget[]): string {
    return rewriteUrl(text, rev, targets, this.#rewriteUrlSchemes)
  }

  private sureNotReady(name: string) {
    if (this.isReady) {
      throw new Error(`HttpMessage is ready on: ${name}`)
    }
  }

  private sureIsReady(name: string) {
    if (!this.isReady) {
      throw new Error(`HttpMessage not ready on: ${name}`)
    }
  }

  private typesSwitch: Record<HttpType, HttpType[]> = {
    'normal-simple': [...HTTP_TYPES_NORMAL],
    'normal-stream-request': [...HTTP_TYPES_NORMAL],
    'normal-stream-response': [...HTTP_TYPES_NORMAL],
    'websocket': [...HTTP_TYPES_WEBSOCKET],
  } as const
}

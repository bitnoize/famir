import { arrayIncludes, randomIdent, serializeError } from '@famir/common'
import {
  HTTP_TYPES_NORMAL,
  HTTP_TYPES_WEBSOCKET,
  HttpConnection,
  HttpContentType,
  HttpError,
  HttpJson,
  HttpPayload,
  HttpQueryString,
  HttpText,
  HttpType,
} from '@famir/domain'
import { Transform } from 'node:stream'
import { HttpBodyWrap } from './body.js'
import { CheerioAPI, cheerioLoad } from './cheerio.js'
import { HttpContentTypeName, HttpContentTypes } from './content-type.js'
import { HttpHeadersWrap } from './headers.js'
import { HttpMethodWrap } from './method.js'
import { RewriteUrlScheme, RewriteUrlTarget, rewriteUrl } from './rewrite-url.js'
import { HttpStatusWrap } from './status.js'
import { HttpUrlWrap } from './url.js'

/**
 * Interceptor function type for message processing.
 *
 * Interceptors are used to modify or inspect the message at various stages
 * of the request/response lifecycle.
 */
export type HttpMessageInterceptor = (message: HttpMessage) => void

/**
 * Array of interceptor functions with their names.
 *
 * @internal
 */
type HttpMessageInterceptors = Array<[string, HttpMessageInterceptor]>

/**
 * Complete HTTP message representation with request and response components.
 *
 * Supports both normal HTTP and WebSocket messages with interceptor pipelines.
 */
export class HttpMessage {
  /**
   * Factory method to create a message by type.
   *
   * @param type - The message type.
   * @returns A new message instance.
   * @throws Error If the message type is unknown.
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

  /** Request method wrapper. */
  readonly method: HttpMethodWrap

  /** Request URL wrapper. */
  readonly url: HttpUrlWrap

  /** Request headers wrapper. */
  readonly requestHeaders: HttpHeadersWrap

  /** Request body wrapper. */
  readonly requestBody: HttpBodyWrap

  /** Response status wrapper. */
  readonly status: HttpStatusWrap

  /** Response headers wrapper. */
  readonly responseHeaders: HttpHeadersWrap

  /** Response body wrapper. */
  readonly responseBody: HttpBodyWrap

  /** Unique identifier for this message. */
  readonly id = randomIdent()

  /**
   * Creates a new message instance.
   *
   * @param type - The message type.
   */
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
   * Checks if the message is ready for processing.
   *
   * @returns `true` if the message is ready, `false` otherwise.
   */
  get isReady(): boolean {
    return this.#isReady
  }

  /**
   * Marks the message as ready for processing.
   *
   * After this call, the message structure or content cannot be modified.
   */
  ready() {
    this.#isReady = true
  }

  /**
   * Gets the message type.
   *
   * @returns The current message type.
   */
  get type(): HttpType {
    return this.#type
  }

  /**
   * Sets the message type with validation.
   *
   * The type can only be changed to a compatible type based on the current type.
   *
   * @param type - The new message type.
   * @throws Error If the message is already ready.
   * @throws Error If the type transition is invalid.
   */
  setType(type: HttpType) {
    this.sureNotReady('setType')

    if (!arrayIncludes(this.typesSwitch[this.type], type)) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Wrong message type switch: ${this.type} => ${type}`)
    }

    this.#type = type
  }

  /** Connection details for this message. */
  readonly connection: HttpConnection = {}

  /**
   * Merges connection details into the message.
   *
   * @param connection - The connection details to merge.
   */
  mergeConnection(connection: HttpConnection) {
    Object.entries(connection).forEach(([name, value]) => {
      if (value != null) {
        this.connection[name] = value
      }
    })
  }

  /** Payload data for this message. */
  readonly payload: HttpPayload = {}

  /** Accumulated errors during processing. */
  readonly errors: HttpError[] = []

  /**
   * Adds an error with a path context.
   *
   * @param error - The error object or unknown value.
   * @param path - The path segments indicating where the error occurred.
   */
  addError(error: unknown, path: string[]) {
    this.errors.push([serializeError(error), path])
  }

  /** Name of the analyze queue job. */
  analyze: string = ''

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
   * Registers MIME types for a content-type category.
   *
   * @param name - The content-type category name.
   * @param types - The array of MIME types to register.
   * @throws Error If the message is already ready.
   */
  addContentTypes(name: HttpContentTypeName, types: string[]) {
    this.sureNotReady('addContentTypes')

    this.#contentTypes[name].push(...types)
  }

  /**
   * Checks if a request content-type belongs to a category.
   *
   * @param name - The content-type category name.
   * @param contentType - The parsed content-type to check.
   * @returns `true` if the content-type matches the category, `false` otherwise.
   */
  isRequestContentType(name: HttpContentTypeName): boolean {
    const contentType = this.requestHeaders.getContentType()
    return this.isContentType(contentType, name)
  }

  /**
   * Checks if a response content-type belongs to a category.
   *
   * @param name - The content-type category name.
   * @param contentType - The parsed content-type to check.
   * @returns `true` if the content-type matches the category, `false` otherwise.
   */
  isResponseContentType(name: HttpContentTypeName): boolean {
    const contentType = this.responseHeaders.getContentType()
    return this.isContentType(contentType, name)
  }

  protected isContentType(contentType: HttpContentType | null, name: HttpContentTypeName): boolean {
    return contentType ? this.#contentTypes[name].includes(contentType.type) : false
  }

  #rewriteUrlContentTypes: string[] = []

  /**
   * Adds content-types eligible for URL rewriting.
   *
   * @param types - The array of MIME types to add.
   * @throws Error If the message is already ready.
   */
  addRewriteUrlContentTypes(types: string[]) {
    this.sureNotReady('addRewriteUrlContentTypes')

    this.#rewriteUrlContentTypes.push(...types)
  }

  /**
   * Checks if a content-type supports URL rewriting.
   *
   * @param contentType - The parsed content-type to check.
   * @returns `true` if rewriting is applicable, `false` otherwise.
   */
  isRewriteUrlContentType(contentType: HttpContentType): boolean {
    return this.#rewriteUrlContentTypes.includes(contentType.type)
  }

  #rewriteUrlSchemes: RewriteUrlScheme[] = [
    ['://', true],
    ['//', false],
  ]

  /**
   * Adds extra URL rewriting schemes for percent and unicode encoded URLs.
   *
   * @throws Error If the message is already ready.
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
   * Adds a request head interceptor.
   *
   * Request head interceptors are called before the request body is processed.
   *
   * @param name - The interceptor identifier.
   * @param interceptor - The interceptor function.
   * @throws Error If the message is already ready.
   */
  addRequestHeadInterceptor(name: string, interceptor: HttpMessageInterceptor) {
    this.sureNotReady('addRequestHeadInterceptor')

    this.#requestHeadInterceptors.push([name, interceptor])
  }

  /**
   * Adds a request body interceptor.
   *
   * Request body interceptors are called after the request head interceptors.
   *
   * @param name - The interceptor identifier.
   * @param interceptor - The interceptor function.
   * @throws Error If the message is already ready.
   */
  addRequestBodyInterceptor(name: string, interceptor: HttpMessageInterceptor) {
    this.sureNotReady('addRequestBodyInterceptor')

    this.#requestBodyInterceptors.push([name, interceptor])
  }

  /**
   * Runs all registered request head interceptors in order.
   *
   * This method freezes the method and URL after execution.
   *
   * @throws Error If the message is not ready.
   */
  runRequestHeadInterceptors() {
    this.sureIsReady('runRequestHeadInterceptors')

    for (const [name, interceptor] of this.#requestHeadInterceptors) {
      try {
        interceptor(this)
      } catch (error) {
        this.addError(error, ['request-head-interceptor', name])
      }
    }

    this.method.freeze()
    this.url.freeze()
  }

  /**
   * Runs all registered request body interceptors in order.
   *
   * This method freezes the request headers and body after execution.
   *
   * @throws Error If the message is not ready.
   */
  runRequestBodyInterceptors() {
    this.sureIsReady('runRequestBodyInterceptors')

    for (const [name, interceptor] of this.#requestBodyInterceptors) {
      try {
        interceptor(this)
      } catch (error) {
        this.addError(error, ['request-body-interceptor', name])
      }
    }

    this.requestHeaders.set('Content-Length', this.requestBody.length.toString())

    this.requestHeaders.freeze()
    this.requestBody.freeze()
  }

  #requestTransforms: Transform[] = []

  /**
   * Adds a stream transform for the request body.
   *
   * @param transform - The transform stream to add.
   * @throws Error If the message is already ready.
   */
  addRequestTransform(transform: Transform) {
    this.sureNotReady('addRequestTransform')

    this.#requestTransforms.push(transform)
  }

  /**
   * Gets the request transforms.
   *
   * @returns The array of transforms.
   */
  getRequestTransforms(): Transform[] {
    return this.#requestTransforms
  }

  #responseHeadInterceptors: HttpMessageInterceptors = []
  #responseBodyInterceptors: HttpMessageInterceptors = []

  /**
   * Adds a response head interceptor.
   *
   * Response head interceptors are called before the response body is processed.
   *
   * @param name - The interceptor identifier.
   * @param interceptor - The interceptor function.
   * @throws Error If the message is already ready.
   */
  addResponseHeadInterceptor(name: string, interceptor: HttpMessageInterceptor) {
    this.sureNotReady('addResponseHeadInterceptor')

    this.#responseHeadInterceptors.push([name, interceptor])
  }

  /**
   * Adds a response body interceptor.
   *
   * Response body interceptors are called after the response head interceptors.
   *
   * @param name - The interceptor identifier.
   * @param interceptor - The interceptor function.
   * @throws Error If the message is already ready.
   */
  addResponseBodyInterceptor(name: string, interceptor: HttpMessageInterceptor) {
    this.sureNotReady('addResponseBodyInterceptor')

    this.#responseBodyInterceptors.push([name, interceptor])
  }

  /**
   * Runs all registered response head interceptors in order.
   *
   * This method freezes the status after execution.
   *
   * @throws Error If the message is not ready.
   */
  runResponseHeadInterceptors() {
    this.sureIsReady('runResponseHeadInterceptors')

    for (const [name, interceptor] of this.#responseHeadInterceptors) {
      try {
        interceptor(this)
      } catch (error) {
        this.addError(error, ['response-head-interceptor', name])
      }
    }

    this.status.freeze()
  }

  /**
   * Runs all registered response body interceptors in order.
   *
   * This method freezes the response headers and body after execution.
   *
   * @throws Error If the message is not ready.
   */
  runResponseBodyInterceptors() {
    this.sureIsReady('runResponseBodyInterceptors')

    for (const [name, interceptor] of this.#responseBodyInterceptors) {
      try {
        interceptor(this)
      } catch (error) {
        this.addError(error, ['response-body-interceptor', name])
      }
    }

    this.responseHeaders.set('Content-Length', this.responseBody.length.toString())

    this.responseHeaders.freeze()
    this.responseBody.freeze()
  }

  #responseTransforms: Transform[] = []

  /**
   * Adds a stream transform for the response body.
   *
   * @param transform - The transform stream to add.
   * @throws Error If the message is already ready.
   */
  addResponseTransform(transform: Transform) {
    this.sureNotReady('addResponseTransform')

    this.#responseTransforms.push(transform)
  }

  /**
   * Gets the response transforms.
   *
   * @returns The array of transforms.
   */
  getResponseTransforms(): Transform[] {
    return this.#responseTransforms
  }

  /**
   * Retrieves request body as plain text.
   */
  retrieveRequestBodyText(): HttpText | null {
    return this.retrieveBodyText(this.requestHeaders, this.requestBody)
  }

  /**
   * Retrieves response body as plain text.
   */
  retrieveResponseBodyText(): HttpText | null {
    return this.retrieveBodyText(this.responseHeaders, this.responseBody)
  }

  private retrieveBodyText(headers: HttpHeadersWrap, body: HttpBodyWrap): HttpText | null {
    try {
      const contentType = headers.getContentType()
      const charset = contentType ? contentType.parameters['charset'] : undefined

      return body.getText(charset)
    } catch (error) {
      this.addError(error, ['retrieve-body-text'])
      return null
    }
  }

  /**
   * Decorates request body as plain text.
   */
  decorateRequestBodyText(cb: (text: HttpText) => HttpText) {
    this.decorateBodyText(this.requestHeaders, this.requestBody, cb)
  }

  /**
   * Decorates response body as plain text.
   */
  decorateResponseBodyText(cb: (text: HttpText) => HttpText) {
    this.decorateBodyText(this.responseHeaders, this.responseBody, cb)
  }

  private decorateBodyText(
    headers: HttpHeadersWrap,
    body: HttpBodyWrap,
    cb: (text: HttpText) => HttpText
  ) {
    try {
      const contentType = headers.getContentType()
      const charset = contentType ? contentType.parameters['charset'] : undefined

      const oldText = body.getText(charset)

      const newText = cb(oldText)

      body.setText(newText)
    } catch (error) {
      this.addError(error, ['decorate-body-text'])
    }
  }

  /**
   * Retrieves request body as JSON.
   */
  retrieveRequestBodyJson(): HttpJson | null {
    return this.retrieveBodyJson(this.requestHeaders, this.requestBody)
  }

  /**
   * Retrieves response body as JSON.
   */
  retrieveResponseBodyJson(): HttpJson | null {
    return this.retrieveBodyJson(this.responseHeaders, this.responseBody)
  }

  private retrieveBodyJson(headers: HttpHeadersWrap, body: HttpBodyWrap): HttpJson | null {
    try {
      const contentType = headers.getContentType()
      const charset = contentType ? contentType.parameters['charset'] : undefined

      return body.getJson(charset)
    } catch (error) {
      this.addError(error, ['retrieve-body-json'])
      return null
    }
  }

  /**
   * Decorates request body as JSON.
   */
  decorateRequestBodyJson(cb: (json: HttpJson) => void) {
    this.decorateBodyJson(this.requestHeaders, this.requestBody, cb)
  }

  /**
   * Decorates response body as JSON.
   */
  decorateResponseBodyJson(cb: (json: HttpJson) => void) {
    this.decorateBodyJson(this.responseHeaders, this.responseBody, cb)
  }

  private decorateBodyJson(
    headers: HttpHeadersWrap,
    body: HttpBodyWrap,
    cb: (json: HttpJson) => void
  ) {
    try {
      const contentType = headers.getContentType()
      const charset = contentType ? contentType.parameters['charset'] : undefined

      const json = body.getJson(charset)

      cb(json)

      body.setJson(json)
    } catch (error) {
      this.addError(error, ['decorate-body-json'])
    }
  }

  /**
   * Retrieves request body as Query String.
   */
  retrieveRequestBodyQueryString(): HttpQueryString | null {
    return this.retrieveBodyQueryString(this.requestHeaders, this.requestBody)
  }

  /**
   * Retrieves response body as Query String.
   */
  retrieveResponseBodyQueryString(): HttpQueryString | null {
    return this.retrieveBodyQueryString(this.responseHeaders, this.responseBody)
  }

  private retrieveBodyQueryString(
    headers: HttpHeadersWrap,
    body: HttpBodyWrap
  ): HttpQueryString | null {
    try {
      const contentType = headers.getContentType()
      const charset = contentType ? contentType.parameters['charset'] : undefined

      return body.getQueryString(charset)
    } catch (error) {
      this.addError(error, ['retrieve-body-query-string'])
      return null
    }
  }

  /**
   * Decorates request body as Query String.
   */
  decorateRequestBodyQueryString(cb: (queryString: HttpQueryString) => void) {
    this.decorateBodyQueryString(this.requestHeaders, this.requestBody, cb)
  }

  /**
   * Decorates response body as Query String.
   */
  decorateResponseBodyQueryString(cb: (queryString: HttpQueryString) => void) {
    this.decorateBodyQueryString(this.responseHeaders, this.responseBody, cb)
  }

  private decorateBodyQueryString(
    headers: HttpHeadersWrap,
    body: HttpBodyWrap,
    cb: (queryString: HttpQueryString) => void
  ) {
    try {
      const contentType = headers.getContentType()
      const charset = contentType ? contentType.parameters['charset'] : undefined

      const queryString = body.getQueryString(charset)

      cb(queryString)

      body.setQueryString(queryString)
    } catch (error) {
      this.addError(error, ['decorate-body-query-string'])
    }
  }

  /**
   * Retrieves request body as HTML.
   */
  retrieveRequestBodyHtml(): CheerioAPI | null {
    return this.retrieveBodyHtml(this.requestHeaders, this.requestBody)
  }

  /**
   * Retrieves response body as HTML.
   */
  retrieveResponseBodyHtml(): CheerioAPI | null {
    return this.retrieveBodyHtml(this.responseHeaders, this.responseBody)
  }

  private retrieveBodyHtml(headers: HttpHeadersWrap, body: HttpBodyWrap): CheerioAPI | null {
    try {
      const contentType = headers.getContentType()
      const charset = contentType ? contentType.parameters['charset'] : undefined

      const text = body.getText(charset)

      return cheerioLoad(text)
    } catch (error) {
      this.addError(error, ['retrieve-body-html'])
      return null
    }
  }

  /**
   * Deocrates request body as HTML.
   */
  decorateRequestBodyHtml(cb: ($: CheerioAPI) => void) {
    this.decorateBodyHtml(this.requestHeaders, this.requestBody, cb)
  }

  /**
   * Deocrates response body as HTML.
   */
  decorateResponseBodyHtml(cb: ($: CheerioAPI) => void) {
    this.decorateBodyHtml(this.responseHeaders, this.responseBody, cb)
  }

  private decorateBodyHtml(
    headers: HttpHeadersWrap,
    body: HttpBodyWrap,
    cb: ($: CheerioAPI) => void
  ) {
    try {
      const contentType = headers.getContentType()
      const charset = contentType ? contentType.parameters['charset'] : undefined

      const text = body.getText(charset)

      const $ = cheerioLoad(text)

      cb($)

      body.setText($.html())
    } catch (error) {
      this.addError(error, ['decorate-body-html'])
    }
  }

  /**
   * Retrieves request body as XML.
   */
  retrieveRequestBodyXml(): CheerioAPI | null {
    return this.retrieveBodyXml(this.requestHeaders, this.requestBody)
  }

  /**
   * Retrieves response body as XML.
   */
  retrieveResponseBodyXml(): CheerioAPI | null {
    return this.retrieveBodyXml(this.responseHeaders, this.responseBody)
  }

  private retrieveBodyXml(headers: HttpHeadersWrap, body: HttpBodyWrap): CheerioAPI | null {
    try {
      const contentType = headers.getContentType()
      const charset = contentType ? contentType.parameters['charset'] : undefined

      const text = body.getText(charset)

      return cheerioLoad(text, { xml: true })
    } catch (error) {
      this.addError(error, ['retrieve-body-xml'])
      return null
    }
  }

  /**
   * Decorate request body as XML.
   */
  decorateRequestBodyXml(cb: ($: CheerioAPI) => void) {
    this.decorateBodyXml(this.requestHeaders, this.requestBody, cb)
  }

  /**
   * Decorate response body as XML.
   */
  decorateResponseBodyXml(cb: ($: CheerioAPI) => void) {
    this.decorateBodyXml(this.responseHeaders, this.responseBody, cb)
  }

  private decorateBodyXml(
    headers: HttpHeadersWrap,
    body: HttpBodyWrap,
    cb: ($: CheerioAPI) => void
  ) {
    try {
      const contentType = headers.getContentType()
      const charset = contentType ? contentType.parameters['charset'] : undefined

      const text = body.getText(charset)

      const $ = cheerioLoad(text, { xml: true })

      cb($)

      body.setText($.xml())
    } catch (error) {
      this.addError(error, ['decorate-body-xml'])
    }
  }

  /**
   * Checks if a string is an absolute URL.
   *
   * @param value - The URL string to check.
   * @returns `true` if it's an absolute URL, `false` otherwise.
   */
  isAbsoluteUrl(value: string): boolean {
    const regExp = /^https?:\/\/|^\/\//i
    return regExp.test(value)
  }

  /**
   * Rewrites URLs in text content.
   *
   * @param text - The text content containing URLs.
   * @param rev - If `false`, replaces donor to mirror; if `true`, replaces mirror to donor.
   * @param targets - The URL rewrite targets.
   * @returns The text with rewritten URLs.
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

import {
  HttpConnection,
  HttpError,
  HttpPayload,
  HttpType,
  arrayIncludes,
  randomIdent,
  serializeError
} from '@famir/common'
import { Transform } from 'node:stream'
import { HttpBodyWrap } from './body.js'
import { HttpContentType, HttpContentTypeName, HttpContentTypes } from './content-type.js'
import { HttpHeadersWrap } from './headers.js'
import { HttpMethodWrap } from './method.js'
import { RewriteUrlScheme, RewriteUrlTarget, rewriteUrl } from './rewrite-url.js'
import { HttpStatusWrap } from './status.js'
import { HttpUrlWrap } from './url.js'

export type HttpMessageInterceptor = (message: HttpMessage) => void

export class HttpMessage {
  /*
   * Create message
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

  readonly id = randomIdent()

  #type: HttpType

  readonly method: HttpMethodWrap
  readonly url: HttpUrlWrap
  readonly requestHeaders: HttpHeadersWrap
  readonly requestBody: HttpBodyWrap
  readonly status: HttpStatusWrap
  readonly responseHeaders: HttpHeadersWrap
  readonly responseBody: HttpBodyWrap

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

  get isReady(): boolean {
    return this.#isReady
  }

  ready() {
    this.#isReady = true
  }

  get type(): HttpType {
    return this.#type
  }

  setType(type: HttpType) {
    this.sureNotReady('setType')

    if (!arrayIncludes(this.typesSwitch[this.type], type)) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Wrong type switch: ${this.type} => ${type}`)
    }

    this.#type = type
  }

  readonly connection: HttpConnection = {}

  mergeConnection(connection: HttpConnection) {
    Object.entries(connection).forEach(([name, value]) => {
      if (value != null) {
        this.connection[name] = value
      }
    })
  }

  readonly payload: HttpPayload = {}

  readonly errors: HttpError[] = []

  addError(error: unknown, ...path: string[]) {
    this.errors.push([serializeError(error), ...path])
  }

  processor: string | null = null

  protected readonly contentTypes: HttpContentTypes = {
    text: [],
    html: [],
    css: [],
    javascript: [],
    json: [],
    xml: [],
    urlEncoded: []
  }

  addContentTypes(name: HttpContentTypeName, types: string[]) {
    this.sureNotReady('addContentTypes')

    this.contentTypes[name].push(...types)
  }

  isContentType(name: HttpContentTypeName, contentType: HttpContentType): boolean {
    return this.contentTypes[name].includes(contentType.type)
  }

  protected readonly rewriteUrlContentTypes: string[] = []

  addRewriteUrlContentTypes(types: string[]) {
    this.sureNotReady('addRewriteUrlContentTypes')

    this.rewriteUrlContentTypes.push(...types)
  }

  isRewriteUrlContentType(contentType: HttpContentType): boolean {
    return this.rewriteUrlContentTypes.includes(contentType.type)
  }

  protected readonly rewriteUrlSchemes: RewriteUrlScheme[] = [
    ['://', true],
    ['//', false]
  ]

  addRewriteUrlMoreSchemes() {
    this.sureNotReady('addRewriteUrlMoreSchemes')

    this.rewriteUrlSchemes.push(
      ['%3A%2F%2F', true],
      ['%2F%2F', false],
      [':\\u002F\\u002F', true],
      ['\\u002F\\u002F', false]
    )
  }

  private requestHeadInterceptors: Array<[string, HttpMessageInterceptor]> = []
  private requestBodyInterceptors: Array<[string, HttpMessageInterceptor]> = []

  addRequestHeadInterceptor(name: string, interceptor: HttpMessageInterceptor) {
    this.sureNotReady('addRequestHeadInterceptor')

    this.requestHeadInterceptors.push([name, interceptor])
  }

  addRequestBodyInterceptor(name: string, interceptor: HttpMessageInterceptor) {
    this.sureNotReady('addRequestBodyInterceptor')

    this.requestBodyInterceptors.push([name, interceptor])
  }

  runRequestHeadInterceptors() {
    this.sureIsReady('runRequestHeadInterceptors')

    for (const [name, interceptor] of this.requestHeadInterceptors) {
      try {
        interceptor(this)
      } catch (error) {
        this.addError(error, 'request-head-interceptor', name)
      }
    }

    this.url.freeze()
  }

  runRequestBodyInterceptors() {
    this.sureIsReady('runRequestBodyInterceptors')

    for (const [name, interceptor] of this.requestBodyInterceptors) {
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

  private requestTransforms: Transform[] = []

  addRequestTransform(transform: Transform) {
    this.sureNotReady('addRequestTransform')

    this.requestTransforms.push(transform)
  }

  getRequestTransforms(): Readonly<Transform[]> {
    return this.requestTransforms
  }

  private responseHeadInterceptors: Array<[string, HttpMessageInterceptor]> = []
  private responseBodyInterceptors: Array<[string, HttpMessageInterceptor]> = []

  addResponseHeadInterceptor(name: string, interceptor: HttpMessageInterceptor) {
    this.sureNotReady('addResponseHeadInterceptor')

    this.responseHeadInterceptors.push([name, interceptor])
  }

  addResponseBodyInterceptor(name: string, interceptor: HttpMessageInterceptor) {
    this.sureNotReady('addResponseBodyInterceptor')

    this.responseBodyInterceptors.push([name, interceptor])
  }

  runResponseHeadInterceptors() {
    this.sureIsReady('runResponseHeadInterceptors')

    for (const [name, interceptor] of this.responseHeadInterceptors) {
      try {
        interceptor(this)
      } catch (error) {
        this.addError(error, 'response-head-interceptor', name)
      }
    }

    this.status.freeze()
  }

  runResponseBodyInterceptors() {
    this.sureIsReady('runResponseBodyInterceptors')

    for (const [name, interceptor] of this.responseBodyInterceptors) {
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

  private responseTransforms: Transform[] = []

  addResponseTransform(transform: Transform) {
    this.sureNotReady('addResponseTransform')

    this.responseTransforms.push(transform)
  }

  getResponseTransforms(): Readonly<Transform[]> {
    return this.responseTransforms
  }

  isAbsoluteUrl(value: string): boolean {
    const regExp = /^https?:\/\/|^\/\//i
    return regExp.test(value)
  }

  rewriteUrl(text: string, rev: boolean, targets: RewriteUrlTarget[]): string {
    return rewriteUrl(text, rev, targets, this.rewriteUrlSchemes)
  }

  protected sureNotReady(name: string) {
    if (this.isReady) {
      throw new Error(`HttpMessage is ready on: ${name}`)
    }
  }

  protected sureIsReady(name: string) {
    if (!this.isReady) {
      throw new Error(`HttpMessage not ready on: ${name}`)
    }
  }

  private typesSwitch: Record<HttpType, HttpType[]> = {
    'normal-simple': ['normal-simple', 'normal-stream-request', 'normal-stream-response'],
    'normal-stream-request': ['normal-simple', 'normal-stream-request', 'normal-stream-response'],
    'normal-stream-response': ['normal-simple', 'normal-stream-request', 'normal-stream-response'],
    websocket: ['websocket']
  } as const
}

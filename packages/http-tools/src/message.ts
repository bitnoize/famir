import { randomIdent, serializeError } from '@famir/common'
import { HttpBodyWrap } from './body.js'
import { HttpContentType, HttpContentTypeName, HttpContentTypes } from './content-type.js'
import { HttpHeadersWrap } from './headers.js'
import { HttpMethodWrap } from './method.js'
import { HttpConnection, HttpError, HttpKind, HttpPayload } from './misc.js'
import { RewriteUrlScheme, RewriteUrlTarget, rewriteUrl } from './rewrite-url.js'
import { HttpStatusWrap } from './status.js'
import { HttpUrlWrap } from './url.js'

export type HttpMessageInterceptor = (message: HttpMessage) => void

export class HttpMessage {
  readonly id = randomIdent()
  protected isReady: boolean = false

  constructor(
    readonly method: HttpMethodWrap,
    readonly url: HttpUrlWrap,
    readonly requestHeaders: HttpHeadersWrap,
    readonly requestBody: HttpBodyWrap,
    readonly status: HttpStatusWrap,
    readonly responseHeaders: HttpHeadersWrap,
    readonly responseBody: HttpBodyWrap
  ) {}

  ready() {
    this.isReady ||= true
  }

  #kind: HttpKind = 'simple'

  getKind(): HttpKind {
    return this.#kind
  }

  setKind(kind: HttpKind) {
    this.sureNotReady('setKind')

    this.#kind = kind
  }

  isKind(kind: HttpKind | HttpKind[]): boolean {
    const values = Array.isArray(kind) ? kind : [kind]
    return values.includes(this.getKind())
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

  score: number = 0

  analyzeLog: string = 'dummy'

  protected readonly contentTypes: HttpContentTypes = {
    text: [],
    html: [],
    css: [],
    javascript: [],
    json: [],
    xml: [],
    urlEncoded: []
  }

  addContentTypes(name: HttpContentTypeName, ...types: string[]) {
    this.sureNotReady('addContentTypes')

    this.contentTypes[name].push(...types)
  }

  isContentType(contentType: HttpContentType, name: HttpContentTypeName): boolean {
    return this.contentTypes[name].includes(contentType.type)
  }

  protected readonly rewriteUrlTypes: string[] = []

  addRewriteUrlTypes(...types: string[]) {
    this.sureNotReady('addRewriteUrlTypes')

    this.rewriteUrlTypes.push(...types)
  }

  isRewriteUrlType(contentType: HttpContentType): boolean {
    return this.rewriteUrlTypes.includes(contentType.type)
  }

  protected readonly rewriteUrlSchemes: RewriteUrlScheme[] = [
    ['://', true],
    ['//', false]
  ]

  addRewriteUrlSchemes(...schemes: RewriteUrlScheme[]) {
    this.sureNotReady('addRewriteUrlSchemes')

    this.rewriteUrlSchemes.push(...schemes)
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

    if (this.requestBody.length > 0) {
      for (const [name, interceptor] of this.requestBodyInterceptors) {
        try {
          interceptor(this)
        } catch (error) {
          this.addError(error, 'request-body-interceptor', name)
        }
      }
    }

    this.requestHeaders.freeze()
    this.requestBody.freeze()
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

    if (this.responseBody.length > 0) {
      for (const [name, interceptor] of this.responseBodyInterceptors) {
        try {
          interceptor(this)
        } catch (error) {
          this.addError(error, 'response-body-interceptor', name)
        }
      }
    }

    this.responseHeaders.freeze()
    this.responseBody.freeze()
  }

  rewriteUrl(text: string, rev: boolean, targets: RewriteUrlTarget[]): string {
    return rewriteUrl(text, rev, targets, this.rewriteUrlSchemes)
  }

  protected sureNotReady(name: string) {
    if (this.isReady) {
      throw new Error(`Message is ready on: ${name}`)
    }
  }

  protected sureIsReady(name: string) {
    if (!this.isReady) {
      throw new Error(`Message not ready on: ${name}`)
    }
  }
}

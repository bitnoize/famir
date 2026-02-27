import { randomIdent, serializeError } from '@famir/common'
import {
  HttpBodyWrap,
  HttpConnection,
  HttpContentType,
  HttpContentTypeName,
  HttpContentTypes,
  HttpError,
  HttpHeadersWrap,
  HttpKind,
  HttpMethodWrap,
  HttpPayload,
  HttpStatusWrap,
  HttpUrlWrap,
  RewriteUrlScheme,
  RewriteUrlTarget,
  rewriteUrl
} from '@famir/http-tools'
import { Transform } from 'node:stream'

export type ReverseMessageInterceptor = (message: ReverseMessage) => void

export class ReverseMessage {
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

  analyze: string | null = null

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

  private requestHeadInterceptors: Array<[string, ReverseMessageInterceptor]> = []
  private requestBodyInterceptors: Array<[string, ReverseMessageInterceptor]> = []

  addRequestHeadInterceptor(name: string, interceptor: ReverseMessageInterceptor) {
    this.sureNotReady('addRequestHeadInterceptor')

    this.requestHeadInterceptors.push([name, interceptor])
  }

  addRequestBodyInterceptor(name: string, interceptor: ReverseMessageInterceptor) {
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

  private requestTransforms: Transform[] = []

  addRequestTransform(transform: Transform) {
    this.sureNotReady('addRequestTransform')

    this.requestTransforms.push(transform)
  }

  getRequestTransforms(): Readonly<Transform[]> {
    return this.requestTransforms
  }

  private responseHeadInterceptors: Array<[string, ReverseMessageInterceptor]> = []
  private responseBodyInterceptors: Array<[string, ReverseMessageInterceptor]> = []

  addResponseHeadInterceptor(name: string, interceptor: ReverseMessageInterceptor) {
    this.sureNotReady('addResponseHeadInterceptor')

    this.responseHeadInterceptors.push([name, interceptor])
  }

  addResponseBodyInterceptor(name: string, interceptor: ReverseMessageInterceptor) {
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

  private responseTransforms: Transform[] = []

  addResponseTransform(transform: Transform) {
    this.sureNotReady('addResponseTransform')

    this.responseTransforms.push(transform)
  }

  getResponseTransforms(): Readonly<Transform[]> {
    return this.responseTransforms
  }

  rewriteUrl(text: string, rev: boolean, targets: RewriteUrlTarget[]): string {
    return rewriteUrl(text, rev, targets, this.rewriteUrlSchemes)
  }

  protected sureNotReady(name: string) {
    if (this.isReady) {
      throw new Error(`ReverseMessage is ready on: ${name}`)
    }
  }

  protected sureIsReady(name: string) {
    if (!this.isReady) {
      throw new Error(`ReverseMessage not ready on: ${name}`)
    }
  }
}

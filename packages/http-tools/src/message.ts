import { randomIdent, serializeError } from '@famir/common'
import { HttpBodyWrap } from './body.js'
import { CheerioAPI } from './cheerio.js'
import { HttpContentType, HttpContentTypeName, HttpContentTypes } from './content-type.js'
import { HttpHeadersWrap } from './headers.js'
import { HttpMethodWrap } from './method.js'
import { HttpConnection, HttpError, HttpKind, HttpPayload } from './misc.js'
import {
  RewriteUrlScheme,
  RewriteUrlTarget,
  rewriteUrl,
} from './rewrite-url.js'
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

  ready(): this {
    this.isReady ||= true

    return this
  }

  #kind: HttpKind = 'simple'

  get kind(): HttpKind {
    return this.#kind
  }

  set kind(kind: HttpKind) {
    this.sureNotReady('set kind')

    this.#kind = kind
  }

  readonly connection: HttpConnection = {}

  mergeConnection(connection: HttpConnection): this {
    Object.entries(connection).forEach(([name, value]) => {
      if (value != null) {
        this.connection[name] = value
      }
    })

    return this
  }

  readonly payload: HttpPayload = {}

  readonly errors: HttpError[] = []

  addError(error: unknown, ...path: string[]) {
    this.errors.push([serializeError(error), ...path])
  }

  score: number = 0

  protected readonly contentTypes: HttpContentTypes = {
    text: [],
    html: [],
    css: [],
    javascript: [],
    json: [],
    xml: [],
    urlEncoded: []
  }

  addContentTypes(name: HttpContentTypeName, ...types: string[]): this {
    this.sureNotReady('addContentTypes')

    this.contentTypes[name].push(...types)

    return this
  }

  isContentType(contentType: HttpContentType, name: HttpContentTypeName): boolean {
    return this.contentTypes[name].includes(contentType.type)
  }

  protected readonly rewriteUrlTypes: string[] = []

  addRewriteUrlTypes(...types: string[]): this {
    this.sureNotReady('addRewriteUrlTypes')

    this.rewriteUrlTypes.push(...types)

    return this
  }

  isRewriteUrlType(contentType: HttpContentType): boolean {
    return this.rewriteUrlTypes.includes(contentType.type)
  }

  protected readonly rewriteUrlSchemes: RewriteUrlScheme[] = [
    ['://', true],
    ['//', false]
  ]

  addRewriteUrlSchemes(...schemes: RewriteUrlScheme[]): this {
    this.sureNotReady('addRewriteUrlSchemes')

    this.rewriteUrlSchemes.push(...schemes)

    return this
  }

  private requestHeadInterceptors: Array<[string, HttpMessageInterceptor]> = []
  private requestBodyInterceptors: Array<[string, HttpMessageInterceptor]> = []

  addRequestHeadInterceptor(name: string, interceptor: HttpMessageInterceptor): this {
    this.sureNotReady('addRequestHeadInterceptor')

    this.requestHeadInterceptors.push([name, interceptor])

    return this
  }

  addRequestBodyInterceptor(name: string, interceptor: HttpMessageInterceptor): this {
    this.sureNotReady('addRequestBodyInterceptor')

    this.requestBodyInterceptors.push([name, interceptor])

    return this
  }

  runRequestInterceptors(withBody: boolean): this {
    this.sureIsReady('runRequestInterceptors')

    for (const [name, interceptor] of this.requestHeadInterceptors) {
      try {
        interceptor(this)
      } catch (error) {
        this.addError(error, 'request-head-interceptor', name)
      }
    }

    this.url.freeze()

    if (withBody && this.requestBody.length > 0) {
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

    return this
  }

  private responseHeadInterceptors: Array<[string, HttpMessageInterceptor]> = []
  private responseBodyInterceptors: Array<[string, HttpMessageInterceptor]> = []

  addResponseHeadInterceptor(name: string, interceptor: HttpMessageInterceptor): this {
    this.sureNotReady('addResponseHeadInterceptor')

    this.responseHeadInterceptors.push([name, interceptor])

    return this
  }

  addResponseBodyInterceptor(name: string, interceptor: HttpMessageInterceptor): this {
    this.sureNotReady('addResponseBodyInterceptor')

    this.responseBodyInterceptors.push([name, interceptor])

    return this
  }

  runResponseInterceptors(withBody: boolean): this {
    this.sureIsReady('runResponseInterceptors')

    for (const [name, interceptor] of this.responseHeadInterceptors) {
      try {
        interceptor(this)
      } catch (error) {
        this.addError(error, 'response-head-interceptor', name)
      }
    }

    this.status.freeze()

    if (withBody && this.responseBody.length > 0) {
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

    return this
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

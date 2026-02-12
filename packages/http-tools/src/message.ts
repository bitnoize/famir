import { randomIdent, serializeError } from '@famir/common'
import { HttpBodyWrap } from './body.js'
import { HttpHeadersWrap } from './headers.js'
import { HttpMethodWrap } from './method.js'
import { HttpStatusWrap } from './status.js'
import { HttpUrlWrap } from './url.js'

export const HTTP_KINDS = ['ordinary', 'stream-request', 'stream-response'] as const
export type HttpKind = (typeof HTTP_KINDS)[number]

export type HttpConnection = Record<string, number | string | null | undefined>
export type HttpPayload = Record<string, unknown>
export type HttpError = readonly [object, ...string[]]

export type HttpMessageInterceptor = () => void

export class HttpMessage {
  readonly id = randomIdent()
  protected isFrozen: boolean = false

  constructor(
    readonly method: HttpMethodWrap,
    readonly url: HttpUrlWrap,
    readonly requestHeaders: HttpHeadersWrap,
    readonly requestBody: HttpBodyWrap,
    readonly status: HttpStatusWrap,
    readonly responseHeaders: HttpHeadersWrap,
    readonly responseBody: HttpBodyWrap
  ) {}

  freeze(): this {
    this.isFrozen ||= true

    return this
  }

  #kind: HttpKind = 'ordinary'

  get kind(): HttpKind {
    return this.#kind
  }

  set kind(kind: HttpKind) {
    this.sureNotFrozen('setKind')

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

  private requestHeadInterceptors: Array<[string, HttpMessageInterceptor]> = []
  private requestBodyInterceptors: Array<[string, HttpMessageInterceptor]> = []

  addRequestHeadInterceptor(name: string, interceptor: HttpMessageInterceptor): this {
    this.sureNotFrozen('addRequestHeadInterceptor')

    this.requestHeadInterceptors.push([name, interceptor])

    return this
  }

  addRequestBodyInterceptor(name: string, interceptor: HttpMessageInterceptor): this {
    this.sureNotFrozen('addRequestBodyInterceptor')

    this.requestBodyInterceptors.push([name, interceptor])

    return this
  }

  runRequestInterceptors(withBody: boolean): this {
    this.sureIsFrozen('runRequestInterceptors')

    for (const [name, interceptor] of this.requestHeadInterceptors) {
      try {
        interceptor()
      } catch (error) {
        this.addError(error, 'request-head-interceptor', name)
      }
    }

    this.url.freeze()
    this.requestHeaders.freeze()

    if (withBody && this.requestBody.size > 0) {
      for (const [name, interceptor] of this.requestBodyInterceptors) {
        try {
          interceptor()
        } catch (error) {
          this.addError(error, 'request-body-interceptor', name)
        }
      }
    }

    this.requestBody.freeze()

    return this
  }

  private responseHeadInterceptors: Array<[string, HttpMessageInterceptor]> = []
  private responseBodyInterceptors: Array<[string, HttpMessageInterceptor]> = []

  addResponseHeadInterceptor(name: string, interceptor: HttpMessageInterceptor): this {
    this.sureNotFrozen('addResponseHeadInterceptor')

    this.responseHeadInterceptors.push([name, interceptor])

    return this
  }

  addResponseBodyInterceptor(name: string, interceptor: HttpMessageInterceptor): this {
    this.sureNotFrozen('addResponseBodyInterceptor')

    this.responseBodyInterceptors.push([name, interceptor])

    return this
  }

  runResponseInterceptors(withBody: boolean): this {
    this.sureIsFrozen('runResponseInterceptors')

    for (const [name, interceptor] of this.responseHeadInterceptors) {
      try {
        interceptor()
      } catch (error) {
        this.addError(error, 'response-head-interceptor', name)
      }
    }

    this.status.freeze()
    this.responseHeaders.freeze()

    if (withBody && this.responseBody.size > 0) {
      for (const [name, interceptor] of this.responseBodyInterceptors) {
        try {
          interceptor()
        } catch (error) {
          this.addError(error, 'response-body-interceptor', name)
        }
      }
    }

    this.responseBody.freeze()

    return this
  }

  protected sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Message is frozen on: ${name}`)
    }
  }

  protected sureIsFrozen(name: string) {
    if (!this.isFrozen) {
      throw new Error(`Message not frozen on: ${name}`)
    }
  }
}

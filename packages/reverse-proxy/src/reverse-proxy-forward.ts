import {
  HttpBodyWrapper,
  HttpHeadersWrapper,
  HttpKind,
  HttpMethodWrapper,
  HttpStatusWrapper,
  HttpUrlWrapper
} from '@famir/domain'
import { ReverseProxyMessage } from './reverse-proxy-message.js'

export type ReverseProxyInterceptor = (message: ReverseProxyMessage) => void

export class ReverseProxyForward {
  protected isFrozen: boolean = false
  readonly message: ReverseProxyMessage

  constructor(
    method: HttpMethodWrapper,
    url: HttpUrlWrapper,
    requestHeaders: HttpHeadersWrapper,
    requestBody: HttpBodyWrapper,
    status: HttpStatusWrapper,
    responseHeaders: HttpHeadersWrapper,
    responseBody: HttpBodyWrapper
  ) {
    this.message = new ReverseProxyMessage(
      method,
      url,
      requestHeaders,
      requestBody,
      status,
      responseHeaders,
      responseBody
    )
  }

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

  private requestHeadInterceptors: Array<[string, ReverseProxyInterceptor]> = []
  private requestBodyInterceptors: Array<[string, ReverseProxyInterceptor]> = []

  addRequestHeadInterceptor(name: string, interceptor: ReverseProxyInterceptor): this {
    this.sureNotFrozen('addRequestHeadInterceptor')

    this.requestHeadInterceptors.push([name, interceptor])

    return this
  }

  addRequestBodyInterceptor(name: string, interceptor: ReverseProxyInterceptor): this {
    this.sureNotFrozen('addRequestBodyInterceptor')

    this.requestBodyInterceptors.push([name, interceptor])

    return this
  }

  runRequestInterceptors(withBody: boolean): this {
    this.sureIsFrozen('runRequestInterceptors')

    for (const [name, interceptor] of this.requestHeadInterceptors) {
      try {
        interceptor(this.message)
      } catch (error) {
        this.message.addError(error, 'request-head-interceptor', name)
      }
    }

    this.message.url.freeze()
    this.message.requestHeaders.freeze()

    if (withBody && this.message.requestBody.size > 0) {
      for (const [name, interceptor] of this.requestBodyInterceptors) {
        try {
          interceptor(this.message)
        } catch (error) {
          this.message.addError(error, 'request-body-interceptor', name)
        }
      }
    }

    this.message.requestBody.freeze()

    return this
  }

  private responseHeadInterceptors: Array<[string, ReverseProxyInterceptor]> = []
  private responseBodyInterceptors: Array<[string, ReverseProxyInterceptor]> = []

  addResponseHeadInterceptor(name: string, interceptor: ReverseProxyInterceptor): this {
    this.sureNotFrozen('addResponseHeadInterceptor')

    this.responseHeadInterceptors.push([name, interceptor])

    return this
  }

  addResponseBodyInterceptor(name: string, interceptor: ReverseProxyInterceptor): this {
    this.sureNotFrozen('addResponseBodyInterceptor')

    this.responseBodyInterceptors.push([name, interceptor])

    return this
  }

  runResponseInterceptors(withBody: boolean): this {
    this.sureIsFrozen('runResponseInterceptors')

    for (const [name, interceptor] of this.responseHeadInterceptors) {
      try {
        interceptor(this.message)
      } catch (error) {
        this.message.addError(error, 'response-head-interceptor', name)
      }
    }

    this.message.status.freeze()
    this.message.responseHeaders.freeze()

    if (withBody && this.message.responseBody.size > 0) {
      for (const [name, interceptor] of this.responseBodyInterceptors) {
        try {
          interceptor(this.message)
        } catch (error) {
          this.message.addError(error, 'response-body-interceptor', name)
        }
      }
    }

    this.message.responseBody.freeze()

    return this
  }

  protected sureNotFrozen(name: string) {
    if (this.isFrozen) {
      throw new Error(`Forward is frozen on ${name}`)
    }
  }

  protected sureIsFrozen(name: string) {
    if (!this.isFrozen) {
      throw new Error(`Forward not frozen on ${name}`)
    }
  }
}

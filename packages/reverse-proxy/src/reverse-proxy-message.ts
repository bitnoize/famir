import { randomIdent, serializeError } from '@famir/common'
import {
  HttpBodyWrap,
  HttpConnection,
  HttpError,
  HttpHeadersWrap,
  HttpMethodWrap,
  HttpPayload,
  HttpStatusWrap,
  HttpUrlWrap
} from '@famir/http-tools'

export class ReverseProxyMessage {
  readonly id = randomIdent()

  constructor(
    readonly method: HttpMethodWrap,
    readonly url: HttpUrlWrap,
    readonly requestHeaders: HttpHeadersWrap,
    readonly requestBody: HttpBodyWrap,
    readonly status: HttpStatusWrap,
    readonly responseHeaders: HttpHeadersWrap,
    readonly responseBody: HttpBodyWrap
  ) {}

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
}

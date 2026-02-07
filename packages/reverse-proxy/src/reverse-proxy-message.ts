import { randomIdent, serializeError } from '@famir/common'
import {
  HttpBodyWrapper,
  HttpConnection,
  HttpError,
  HttpHeadersWrapper,
  HttpMethodWrapper,
  HttpPayload,
  HttpStatusWrapper,
  HttpUrlWrapper
} from '@famir/domain'

export class ReverseProxyMessage {
  readonly id = randomIdent()

  constructor(
    readonly method: HttpMethodWrapper,
    readonly url: HttpUrlWrapper,
    readonly requestHeaders: HttpHeadersWrapper,
    readonly requestBody: HttpBodyWrapper,
    readonly status: HttpStatusWrapper,
    readonly responseHeaders: HttpHeadersWrapper,
    readonly responseBody: HttpBodyWrapper
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

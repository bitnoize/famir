import {
  HttpStatusWrapper,
  HttpBodyWrapper,
  HttpHeadersWrapper,
  HttpMethodWrapper,
  HttpServerContext,
  HttpServerError,
  HttpState,
  HttpUrlWrapper
} from '@famir/domain'
import {
  StdHttpBodyWrapper,
  StdHttpHeadersWrapper,
  StdHttpMethodWrapper,
  StdHttpUrlWrapper,
  StdHttpStatusWrapper
} from '@famir/http-tools'
import { isbot } from 'isbot'
import http from 'node:http'

export class StdHttpServerContext implements HttpServerContext {
  readonly state: HttpState = {}
  readonly middlewares: string[] = []

  constructor(
    protected readonly req: http.IncomingMessage,
    protected readonly res: http.ServerResponse
  ) {
    this.method = StdHttpMethodWrapper.fromReq(this.req).freeze()
    this.url = StdHttpUrlWrapper.fromReq(this.req).freeze()
    this.requestHeaders = StdHttpHeadersWrapper.fromReq(this.req).freeze()
    this.requestBody = new StdHttpBodyWrapper()
    this.responseHeaders = StdHttpHeadersWrapper.fromRes(this.res)
    this.responseBody = new StdHttpBodyWrapper()
    this.status = new StdHttpStatusWrapper()
  }

  readonly method: HttpMethodWrapper
  readonly url: HttpUrlWrapper
  readonly requestHeaders: HttpHeadersWrapper
  readonly requestBody: HttpBodyWrapper
  readonly responseHeaders: HttpHeadersWrapper
  readonly responseBody: HttpBodyWrapper
  readonly status: HttpStatusWrapper

  loadRequest(bodyLimit: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      let totalLength = 0

      this.req.on('data', (chunk: Buffer) => {
        totalLength += chunk.length

        if (totalLength > bodyLimit) {
          this.req.destroy()

          reject(
            new HttpServerError(`Content too large`, {
              code: 'CONTENT_TOO_LARGE'
            })
          )
        } else {
          chunks.push(chunk)
        }
      })

      this.req.on('end', () => {
        try {
          const body = Buffer.concat(chunks, totalLength)
          this.requestBody.set(body)

          resolve()
        } catch (error) {
          reject(
            new HttpServerError(`Bad request`, {
              cause: error,
              code: 'BAD_REQUEST'
            })
          )
        }
      })

      this.req.on('error', (error: Error) => {
        reject(
          new HttpServerError(`Load request error`, {
            cause: error,
            code: 'BAD_REQUEST'
          })
        )
      })

      this.req.on('close', () => {
        if (!this.req.complete) {
          reject(
            new HttpServerError(`Request closed before complete`, {
              code: 'BAD_REQUEST'
            })
          )
        }
      })
    })
  }

  sendResponse(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.responseHeaders.forEach((name, value) => {
        this.res.setHeader(name, value)
      })

      if (this.status.isUnknown()) {
        reject(
          new HttpServerError(`Unknown status`, {
            code: 'INTERNAL_ERROR'
          })
        )

        return
      }

      this.res.writeHead(this.status.get())

      this.res.end(this.responseBody.get(), (error?: Error) => {
        this.responseHeaders.freeze()
        this.responseBody.freeze()

        this.#finishTime = Date.now()

        if (error) {
          reject(
            new HttpServerError(`Send response error`, {
              cause: error,
              code: 'INTERNAL_ERROR'
            })
          )
        } else {
          resolve()
        }
      })
    })
  }

  #isBot: boolean | null = null

  get isBot(): boolean {
    if (this.#isBot != null) {
      return this.#isBot
    }

    const value = this.requestHeaders.getString('User-Agent') ?? ''

    this.#isBot = isbot(value)

    return this.#isBot
  }

  #ips: string[] | null = null

  get ips(): string[] {
    if (this.#ips != null) {
      return this.#ips
    }

    const value = this.requestHeaders.getArray('X-Forwarded-For') ?? []

    this.#ips = value
      .join(',')
      .split(',')
      .map((ip) => ip.trim())
      .filter((ip) => ip)

    return this.#ips
  }

  get ip(): string | undefined {
    return this.ips[0] != null ? this.ips[0] : undefined
  }

  readonly startTime: number = Date.now()

  #finishTime: number = 0

  get finishTime(): number {
    return this.#finishTime
  }

  get isComplete(): boolean {
    return this.res.writableEnded
  }
}

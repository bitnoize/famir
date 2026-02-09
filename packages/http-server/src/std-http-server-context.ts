import {
  HttpBodyWrapper,
  HttpHeadersWrapper,
  HttpMethodWrapper,
  HttpServerContext,
  HttpServerContextState,
  HttpServerError,
  HttpStatusWrapper,
  HttpUrlWrapper
} from '@famir/domain'
import {
  StdHttpBodyWrapper,
  StdHttpHeadersWrapper,
  StdHttpMethodWrapper,
  StdHttpStatusWrapper,
  StdHttpUrlWrapper
} from '@famir/http-tools'
import { isbot } from 'isbot'
import http from 'node:http'

export class StdHttpServerContext implements HttpServerContext {
  readonly state: HttpServerContextState = {}
  readonly middlewares: string[] = []

  constructor(
    protected readonly req: http.IncomingMessage,
    protected readonly res: http.ServerResponse
  ) {
    try {
      this.method = StdHttpMethodWrapper.fromReq(req)
      this.url = StdHttpUrlWrapper.fromReq(req).freeze()
      this.requestHeaders = StdHttpHeadersWrapper.fromReq(req).freeze()
      this.requestBody = StdHttpBodyWrapper.fromScratch()
      this.status = StdHttpStatusWrapper.fromScratch()
      this.responseHeaders = StdHttpHeadersWrapper.fromScratch()
      this.responseBody = StdHttpBodyWrapper.fromScratch()
    } catch (error) {
      throw new HttpServerError(`Bad request`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  readonly method: HttpMethodWrapper
  readonly url: HttpUrlWrapper
  readonly requestHeaders: HttpHeadersWrapper
  readonly requestBody: HttpBodyWrapper
  readonly status: HttpStatusWrapper
  readonly responseHeaders: HttpHeadersWrapper
  readonly responseBody: HttpBodyWrapper

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

          return
        }

        chunks.push(chunk)
      })

      this.req.on('end', () => {
        try {
          const body = Buffer.concat(chunks, totalLength)

          this.requestBody.set(body).freeze()

          resolve()
        } catch (error) {
          reject(
            new HttpServerError(`Parse request error`, {
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
          new HttpServerError(`Unknown response status`, {
            code: 'INTERNAL_ERROR'
          })
        )

        return
      }

      this.res.writeHead(this.status.get())

      this.res.end(this.responseBody.get(), (error?: Error) => {
        this.responseHeaders.freeze()
        this.responseBody.freeze()
        this.status.freeze()

        this.#finishTime = Date.now()

        if (error) {
          reject(
            new HttpServerError(`Send response error`, {
              cause: error,
              code: 'INTERNAL_ERROR'
            })
          )

          return
        }

        resolve()
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

  get ip(): string {
    return this.requestHeaders.getString('X-Real-Ip') ?? ''
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

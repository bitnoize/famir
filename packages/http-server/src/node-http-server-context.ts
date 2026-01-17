import { HttpBody, HttpHeaders, HttpServerContext, HttpServerError, HttpState } from '@famir/domain'
import http from 'node:http'
import { URL } from 'node:url'

export class NodeHttpServerContext implements HttpServerContext {
  constructor(
    protected readonly req: http.IncomingMessage,
    protected readonly res: http.ServerResponse
  ) {
    this.url = new URL(this.originUrl, 'http://localhost')
  }

  readonly state: HttpState = {}

  readonly middlewares: string[] = []

  get method(): string {
    return this.req.method ?? 'GET'
  }

  get originUrl(): string {
    return this.req.url ?? '/'
  }

  readonly url: URL

  get requestHeaders(): HttpHeaders {
    return this.req.headers
  }

  loadRequestBody(bodyLimit: number): Promise<HttpBody> {
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
          resolve(Buffer.concat(chunks, totalLength))
        } catch (error) {
          reject(
            new HttpServerError(`Parse request body failed`, {
              cause: error,
              code: 'BAD_REQUEST'
            })
          )
        }
      })

      this.req.on('error', (error: Error) => {
        reject(
          new HttpServerError(`Load request body failed`, {
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

  readonly responseHeaders: HttpHeaders = {}

  sendResponseBody(status: number, body: HttpBody = Buffer.alloc(0)): Promise<void> {
    return new Promise((resolve, reject) => {
      this.res.writeHead(status, this.responseHeaders)

      this.res.end(body, (error?: Error) => {
        this.#finishTime = Date.now()

        if (error) {
          reject(
            new HttpServerError(`Send response failed`, {
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

  get status(): number {
    return this.res.statusCode
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

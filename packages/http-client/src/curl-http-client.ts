import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { HttpBody, HttpConnection, HttpHeaders, HttpMethod } from '@famir/http-tools'
import { Logger, LOGGER } from '@famir/logger'
import { Curl, CurlCode, CurlFeature } from 'node-libcurl'
import { PassThrough, pipeline, Readable } from 'node:stream'
import { HttpClientError, HttpClientErrorCode } from './http-client.error.js'
import {
  CurlHttpClientConfig,
  CurlHttpClientOptions,
  HTTP_CLIENT,
  HttpClient,
  HttpClientErrorResult,
  HttpClientSimpleResult,
  HttpClientStreamResult
} from './http-client.js'

export class CurlHttpClient implements HttpClient {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpClient>(
      HTTP_CLIENT,
      (c) =>
        new CurlHttpClient(
          c.resolve<Config<CurlHttpClientConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  protected readonly options: CurlHttpClientOptions

  constructor(
    config: Config<CurlHttpClientConfig>,
    protected readonly logger: Logger
  ) {
    this.options = this.buildOptions(config.data)

    this.logger.debug(`HttpClient initialized`)
  }

  simpleForward(
    connectTimeout: number,
    timeout: number,
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    responseSizeLimit: number
  ): Promise<HttpClientSimpleResult | HttpClientErrorResult> {
    return new Promise<HttpClientSimpleResult | HttpClientErrorResult>((resolve, reject) => {
      const state: {
        error: HttpClientError | null
        isResolved: boolean
        responseHeaders: Buffer[]
        responseBody: Buffer[]
        responseBodySize: number
      } = {
        error: null,
        isResolved: false,
        responseHeaders: [],
        responseBody: [],
        responseBodySize: 0
      }

      const curl = new Curl()

      curl.enable(CurlFeature.NoStorage)

      this.setupCurlOptions(curl, connectTimeout, timeout, proxy, method, url, requestHeaders)

      this.setupCurlReadfunction(curl, state, requestBody)
      this.setupCurlHeaderfunction(curl, state)
      this.setupCurlWritefunction(curl, state, responseSizeLimit)

      this.setupCurlSimpleEndEvent(curl, state, resolve, reject)
      this.setupCurlSimpleErrorEvent(curl, state, resolve, reject)

      curl.perform()
    })
  }

  streamRequestForward(
    connectTimeout: number,
    timeout: number,
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestStream: Readable,
    responseSizeLimit: number
  ): Promise<HttpClientSimpleResult | HttpClientErrorResult> {
    return new Promise<HttpClientSimpleResult | HttpClientErrorResult>((resolve, reject) => {
      const state: {
        error: HttpClientError | null
        isResolved: boolean
        responseHeaders: Buffer[]
        responseBody: Buffer[]
        responseBodySize: number
      } = {
        error: null,
        isResolved: false,
        responseHeaders: [],
        responseBody: [],
        responseBodySize: 0
      }

      const curl = new Curl()

      curl.enable(CurlFeature.NoStorage)

      this.setupCurlOptions(curl, connectTimeout, timeout, proxy, method, url, requestHeaders)

      this.setupCurlUploadStream(curl, requestStream)

      this.setupCurlHeaderfunction(curl, state)
      this.setupCurlWritefunction(curl, state, responseSizeLimit)

      this.setupCurlSimpleEndEvent(curl, state, resolve, reject)
      this.setupCurlSimpleErrorEvent(curl, state, resolve, reject)

      curl.perform()
    })
  }

  streamResponseForward(
    connectTimeout: number,
    timeout: number,
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    responseSizeLimit: number
  ): Promise<HttpClientStreamResult | HttpClientErrorResult> {
    return new Promise<HttpClientStreamResult | HttpClientErrorResult>((resolve, reject) => {
      const state: {
        error: HttpClientError | null
        isResolved: boolean
        responseHeaders: Buffer[]
        responseStream: PassThrough
      } = {
        error: null,
        isResolved: false,
        responseHeaders: [],
        responseStream: new PassThrough()
      }

      const curl = new Curl()

      curl.enable(CurlFeature.StreamResponse)
      curl.enable(CurlFeature.NoStorage)

      this.setupCurlOptions(curl, connectTimeout, timeout, proxy, method, url, requestHeaders)

      this.setupCurlReadfunction(curl, state, requestBody)
      this.setupCurlHeaderfunction(curl, state)

      this.setupCurlStreamEvent(curl, state, resolve, reject)
      this.setupCurlStreamEndEvent(curl, state, resolve, reject)
      this.setupCurlStreamErrorEvent(curl, state, resolve, reject)

      curl.perform()
    })
  }

  protected setupCurlOptions(
    curl: Curl,
    connectTimeout: number,
    timeout: number,
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders
  ) {
    if (this.options.verbose) {
      curl.setOpt(Curl.option.VERBOSE, true)
    }

    curl.setOpt(Curl.option.DNS_USE_GLOBAL_CACHE, 1)

    curl.setOpt(Curl.option.CONNECTTIMEOUT_MS, connectTimeout)
    curl.setOpt(Curl.option.TIMEOUT_MS, timeout) // Entire request timeout

    curl.setOpt(Curl.option.PROXY, proxy)

    curl.setOpt(Curl.option.CUSTOMREQUEST, method)
    curl.setOpt(Curl.option.URL, url)

    curl.setOpt(Curl.option.HTTPHEADER, this.formatRawHeaders(requestHeaders))
    curl.setOpt(Curl.option.ACCEPT_ENCODING, '') // Means all encodings!
  }

  protected setupCurlReadfunction(
    curl: Curl,
    state: {
      error: HttpClientError | null
    },
    requestBody: HttpBody
  ) {
    let requestBodyOffset = 0

    curl.setOpt(Curl.option.UPLOAD, true)
    curl.setOpt(Curl.option.INFILESIZE_LARGE, requestBody.length)
    curl.setOpt(Curl.option.READFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
      try {
        if (state.error) {
          return 0
        }

        const chunkSize = Math.min(size * nmemb, requestBody.length - requestBodyOffset)

        if (chunkSize <= 0) {
          return 0
        }

        requestBody.copy(buf, 0, requestBodyOffset, requestBodyOffset + chunkSize)

        requestBodyOffset += chunkSize

        return chunkSize
      } catch (error) {
        state.error = new HttpClientError(`Bad gateway`, {
          cause: error,
          context: {
            reason: `Curl READFUNCTION callback failed`
          },
          code: 'BAD_GATEWAY'
        })

        return 0
      }
    })
  }

  protected setupCurlUploadStream(curl: Curl, requestStream: Readable) {
    curl.setOpt(Curl.option.UPLOAD, true)

    curl.setUploadStream(requestStream)
  }

  protected setupCurlHeaderfunction(
    curl: Curl,
    state: {
      error: HttpClientError | null
      responseHeaders: Buffer[]
    }
  ) {
    curl.setOpt(Curl.option.HEADER, false)
    curl.setOpt(Curl.option.HEADERFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
      try {
        if (state.error) {
          return 0
        }

        const chunkSize = size * nmemb
        const chunk = buf.subarray(0, chunkSize)

        state.responseHeaders.push(chunk)

        return chunkSize
      } catch (error) {
        state.error = new HttpClientError(`Bad gateway`, {
          cause: error,
          context: {
            reason: `Curl HEADERFUNCTION callback failed`
          },
          code: 'BAD_GATEWAY'
        })

        return 0
      }
    })
  }

  protected setupCurlWritefunction(
    curl: Curl,
    state: {
      error: HttpClientError | null
      responseBody: Buffer[]
      responseBodySize: number
    },
    responseSizeLimit: number
  ) {
    curl.setOpt(Curl.option.WRITEFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
      try {
        if (state.error) {
          return 0
        }

        const chunkSize = size * nmemb
        const chunk = buf.subarray(0, chunkSize)

        if (state.responseBodySize + chunkSize > responseSizeLimit) {
          state.error = new HttpClientError(`Bad gateway`, {
            context: {
              reason: `Response body size limit exceeded`
            },
            code: 'BAD_GATEWAY'
          })

          return 0
        } else {
          state.responseBody.push(chunk)
          state.responseBodySize += chunkSize

          return chunkSize
        }
      } catch (error) {
        state.error = new HttpClientError(`Bad gateway`, {
          cause: error,
          context: {
            reason: `Curl WRITEFUNCTION callback failed`
          },
          code: 'BAD_GATEWAY'
        })

        return 0
      }
    })
  }

  protected setupCurlSimpleEndEvent(
    curl: Curl,
    state: {
      error: HttpClientError | null
      isResolved: boolean
      responseHeaders: Buffer[]
      responseBody: Buffer[]
      responseBodySize: number
    },
    resolve: (value: HttpClientSimpleResult | HttpClientErrorResult) => void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reject: (reason?: Error) => void
  ) {
    curl.on('end', (status) => {
      curl.close()

      if (!state.isResolved) {
        state.isResolved = true

        if (state.error) {
          resolve({
            error: state.error,
            connection: this.parseConnection(curl)
          })

          return
        }

        const responseHeaders = this.parseRawHeaders(state.responseHeaders)
        const responseBody = this.parseRawBody(state.responseBody, state.responseBodySize)

        responseHeaders['content-length'] = responseBody.length.toString()
        responseHeaders['content-encoding'] = undefined

        resolve({
          error: null,
          status,
          responseHeaders,
          responseBody,
          connection: this.parseConnection(curl)
        })

        return
      }

      console.log(`Simple end event: nothing to do`)
    })
  }

  protected setupCurlSimpleErrorEvent(
    curl: Curl,
    state: {
      error: HttpClientError | null
      isResolved: boolean
    },
    resolve: (value: HttpClientSimpleResult | HttpClientErrorResult) => void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reject: (reason?: Error) => void
  ) {
    curl.on('error', (error: Error, curlCode: CurlCode) => {
      curl.close()

      if (!state.isResolved) {
        state.isResolved = true

        const [code, message] = this.parseCurlCode(curlCode)

        state.error = new HttpClientError(message, {
          cause: error,
          context: {
            reason: `Curl perform failed`,
            curlCode
          },
          code
        })

        resolve({
          error: state.error,
          connection: this.parseConnection(curl)
        })

        return
      }
    })
  }

  protected setupCurlStreamEvent(
    curl: Curl,
    state: {
      error: HttpClientError | null
      isResolved: boolean
      responseHeaders: Buffer[]
      responseStream: PassThrough
    },
    resolve: (value: HttpClientStreamResult | HttpClientErrorResult) => void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reject: (reason?: Error) => void
  ) {
    curl.on('stream', (stream, status) => {
      if (!state.isResolved) {
        state.isResolved = true

        if (state.error) {
          if (!stream.destroyed) {
            stream.destroy(state.error)
          }

          if (!state.responseStream.destroyed) {
            state.responseStream.destroy(state.error)
          }

          resolve({
            error: state.error,
            connection: this.parseConnection(curl)
          })

          return
        }

        pipeline(stream, state.responseStream, (error) => {
          if (error) {
            this.logger.debug(`HttpClient stream pipeline error`, { error })
          }
        })

        const responseHeaders = this.parseRawHeaders(state.responseHeaders)

        responseHeaders['content-encoding'] = undefined

        resolve({
          error: null,
          status,
          responseHeaders,
          responseStream: state.responseStream,
          connection: this.parseConnection(curl)
        })

        return
      }
    })
  }

  protected setupCurlStreamEndEvent(
    curl: Curl,
    state: {
      error: HttpClientError | null
      isResolved: boolean
      responseHeaders: Buffer[]
      responseStream: PassThrough
    },
    resolve: (value: HttpClientStreamResult | HttpClientErrorResult) => void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reject: (reason?: Error) => void
  ) {
    curl.on('end', () => {
      curl.close()

      if (!state.responseStream.writableEnded) {
        state.responseStream.end()
      }

      if (!state.isResolved) {
        state.isResolved = true

        if (state.error) {
          resolve({
            error: state.error,
            connection: this.parseConnection(curl)
          })

          return
        }

        state.error = new HttpClientError(`Bad gateway`, {
          context: {
            reason: `Stream event not triggered`
          },
          code: 'BAD_GATEWAY'
        })

        resolve({
          error: state.error,
          connection: this.parseConnection(curl)
        })

        return
      }
    })
  }

  protected setupCurlStreamErrorEvent(
    curl: Curl,
    state: {
      error: HttpClientError | null
      isResolved: boolean
      responseStream: PassThrough
    },
    resolve: (value: HttpClientStreamResult | HttpClientErrorResult) => void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reject: (reason?: Error) => void
  ) {
    curl.on('error', (error: Error, curlCode: CurlCode) => {
      curl.close()

      if (curlCode === (28 as CurlCode)) {
        if (!state.responseStream.writableEnded) {
          state.responseStream.end()
        }
      } else {
        if (!state.responseStream.destroyed) {
          state.responseStream.destroy(error)
        }
      }

      if (!state.isResolved) {
        state.isResolved = true

        const [code, message] = this.parseCurlCode(curlCode)

        state.error = new HttpClientError(message, {
          cause: error,
          context: {
            reason: `Curl perform failed`,
            curlCode
          },
          code
        })

        resolve({
          error: state.error,
          connection: this.parseConnection(curl)
        })

        return
      }
    })
  }

  protected parseConnection(curl: Curl): HttpConnection {
    try {
      const totalTime = curl.getInfo('TOTAL_TIME_T')
      const connectTime = curl.getInfo('CONNECT_TIME_T')
      const httpVersion = curl.getInfo('HTTP_VERSION')

      return {
        client_total_time: typeof totalTime === 'number' ? totalTime : null,
        client_connect_time: typeof connectTime === 'number' ? connectTime : null,
        client_http_version: typeof httpVersion === 'number' ? httpVersion : null
      }
    } catch {
      return {
        client_total_time: null,
        client_connect_time: null,
        client_http_version: null
      }
    }
  }

  protected parseRawHeaders(curlHeaders: Buffer[]): HttpHeaders {
    const headers: HttpHeaders = {}

    curlHeaders.forEach((curlHeader) => {
      const headerStr = curlHeader.toString().trim()
      const colonIdx = headerStr.indexOf(':')

      if (colonIdx === -1) {
        return
      }

      const name = headerStr.substring(0, colonIdx).trim().toLowerCase()
      const value = headerStr.substring(colonIdx + 1).trim()

      if (!name) {
        return
      }

      if (headers[name] != null) {
        if (Array.isArray(headers[name])) {
          headers[name].push(value)
        } else {
          headers[name] = [headers[name], value]
        }
      } else {
        headers[name] = value
      }
    })

    return headers
  }

  protected formatRawHeaders(headers: HttpHeaders): string[] {
    const curlHeaders: string[] = []

    Object.entries(headers).forEach(([name, value]) => {
      if (value == null) {
        return
      }

      if (Array.isArray(value)) {
        value.forEach((val) => {
          curlHeaders.push(`${name}: ${val}`)
        })
      } else {
        curlHeaders.push(`${name}: ${value}`)
      }
    })

    return curlHeaders
  }

  protected parseRawBody(chunks: Buffer[], size: number): HttpBody {
    try {
      return Buffer.concat(chunks, size)
    } catch {
      return Buffer.alloc(0)
    }
  }

  protected parseCurlCode(curlCode: CurlCode): [HttpClientErrorCode, string] {
    return curlCode === (28 as CurlCode)
      ? ['GATEWAY_TIMEOUT', 'Gateway timeout']
      : ['BAD_GATEWAY', 'Bad gateway']
  }

  private buildOptions(config: CurlHttpClientConfig): CurlHttpClientOptions {
    return {
      verbose: config.HTTP_CLIENT_VERBOSE
    }
  }
}

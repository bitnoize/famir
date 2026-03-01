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
  HttpClientSimpleState,
  HttpClientStreamRequestState,
  HttpClientStreamResponseState,
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

  simple(
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    connectTimeout: number,
    timeout: number,
    headersSizeLimit: number,
    bodySizeLimit: number
  ): Promise<HttpClientSimpleResult | HttpClientErrorResult> {
    return new Promise<HttpClientSimpleResult | HttpClientErrorResult>((resolve, reject) => {
      const state: HttpClientSimpleState = {
        error: null,
        isResolved: false,
        proxy,
        method,
        url,
        requestHeaders,
        requestBody,
        responseHeaders: [],
        responseBody: [],
        connectTimeout,
        timeout,
        headersSizeLimit,
        bodySizeLimit
      }

      const curl = new Curl()

      curl.enable(CurlFeature.NoStorage)

      this.setupCurlOptions(curl, state)

      this.setupCurlReadfunction(curl, state)
      this.setupCurlHeaderfunction(curl, state)
      this.setupCurlWritefunction(curl, state)

      this.setupCurlSimpleEndEvent(curl, state, resolve, reject)
      this.setupCurlSimpleErrorEvent(curl, state, resolve, reject)

      curl.perform()
    })
  }

  streamRequest(
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestStream: Readable,
    connectTimeout: number,
    timeout: number,
    headersSizeLimit: number,
    bodySizeLimit: number
  ): Promise<HttpClientSimpleResult | HttpClientErrorResult> {
    return new Promise<HttpClientSimpleResult | HttpClientErrorResult>((resolve, reject) => {
      const state: HttpClientStreamRequestState = {
        error: null,
        isResolved: false,
        proxy,
        method,
        url,
        requestHeaders,
        requestStream,
        responseHeaders: [],
        responseBody: [],
        connectTimeout,
        timeout,
        headersSizeLimit,
        bodySizeLimit
      }

      const curl = new Curl()

      curl.enable(CurlFeature.NoStorage)

      this.setupCurlOptions(curl, state)

      this.setupCurlUploadStream(curl, state)
      this.setupCurlHeaderfunction(curl, state)
      this.setupCurlWritefunction(curl, state)

      this.setupCurlSimpleEndEvent(curl, state, resolve, reject)
      this.setupCurlSimpleErrorEvent(curl, state, resolve, reject)

      curl.perform()
    })
  }

  streamResponse(
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    connectTimeout: number,
    timeout: number,
    headersSizeLimit: number
  ): Promise<HttpClientStreamResult | HttpClientErrorResult> {
    return new Promise<HttpClientStreamResult | HttpClientErrorResult>((resolve, reject) => {
      const state: HttpClientStreamResponseState = {
        error: null,
        isResolved: false,
        proxy,
        method,
        url,
        requestHeaders,
        requestBody,
        responseHeaders: [],
        responseStream: new PassThrough(),
        connectTimeout,
        timeout,
        headersSizeLimit
      }

      const curl = new Curl()

      curl.enable(CurlFeature.StreamResponse)
      curl.enable(CurlFeature.NoStorage)

      this.setupCurlOptions(curl, state)

      this.setupCurlReadfunction(curl, state)
      this.setupCurlHeaderfunction(curl, state)

      this.setupCurlStreamEvent(curl, state, resolve, reject)
      this.setupCurlStreamEndEvent(curl, state, resolve, reject)
      this.setupCurlStreamErrorEvent(curl, state, resolve, reject)

      curl.perform()
    })
  }

  protected setupCurlOptions(
    curl: Curl,
    state: {
      proxy: string
      method: HttpMethod
      url: string
      requestHeaders: HttpHeaders
      connectTimeout: number
      timeout: number
    }
  ) {
    if (this.options.verbose) {
      curl.setOpt(Curl.option.VERBOSE, true)
    }

    curl.setOpt(Curl.option.DNS_USE_GLOBAL_CACHE, 1)

    curl.setOpt(Curl.option.CONNECTTIMEOUT_MS, state.connectTimeout)
    curl.setOpt(Curl.option.TIMEOUT_MS, state.timeout) // Entire request timeout

    curl.setOpt(Curl.option.PROXY, state.proxy)

    curl.setOpt(Curl.option.CUSTOMREQUEST, state.method)
    curl.setOpt(Curl.option.URL, state.url)

    curl.setOpt(Curl.option.HTTPHEADER, this.formatRawHeaders(state.requestHeaders))
    curl.setOpt(Curl.option.ACCEPT_ENCODING, '') // Means all encodings!
  }

  protected setupCurlReadfunction(
    curl: Curl,
    state: {
      error: HttpClientError | null
      requestBody: HttpBody
    }
  ) {
    let requestBodyOffset = 0

    curl.setOpt(Curl.option.UPLOAD, true)
    curl.setOpt(Curl.option.INFILESIZE_LARGE, state.requestBody.length)
    curl.setOpt(Curl.option.READFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
      try {
        if (state.error) {
          return 0
        }

        const chunkSize = Math.min(size * nmemb, state.requestBody.length - requestBodyOffset)

        if (chunkSize <= 0) {
          return 0
        }

        state.requestBody.copy(buf, 0, requestBodyOffset, requestBodyOffset + chunkSize)

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

  protected setupCurlUploadStream(
    curl: Curl,
    state: {
      requestStream: Readable
    }
  ) {
    curl.setOpt(Curl.option.UPLOAD, true)

    curl.setUploadStream(state.requestStream)
  }

  protected setupCurlHeaderfunction(
    curl: Curl,
    state: {
      error: HttpClientError | null
      responseHeaders: Buffer[]
      headersSizeLimit: number
    }
  ) {
    let responseHeadersSize = 0

    curl.setOpt(Curl.option.HEADER, false)
    curl.setOpt(Curl.option.HEADERFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
      try {
        if (state.error) {
          return 0
        }

        const chunkSize = size * nmemb

        if (responseHeadersSize + chunkSize > state.headersSizeLimit) {
          state.error = new HttpClientError('Bad gateway', {
            context: {
              reason: 'Response headers size limit exceeded'
            },
            code: 'BAD_GATEWAY'
          })

          return 0
        }

        const chunk = buf.subarray(0, chunkSize)
        state.responseHeaders.push(chunk)

        responseHeadersSize += chunkSize

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
      bodySizeLimit: number
    }
  ) {
    let responseBodySize = 0

    curl.setOpt(Curl.option.WRITEFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
      try {
        if (state.error) {
          return 0
        }

        const chunkSize = size * nmemb

        if (responseBodySize + chunkSize > state.bodySizeLimit) {
          state.error = new HttpClientError(`Bad gateway`, {
            context: {
              reason: `Response body size limit exceeded`
            },
            code: 'BAD_GATEWAY'
          })

          return 0
        }

        const chunk = buf.subarray(0, chunkSize)
        state.responseBody.push(chunk)

        responseBodySize += chunkSize

        return chunkSize
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
    },
    resolve: (value: HttpClientSimpleResult | HttpClientErrorResult) => void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reject: (reason?: Error) => void
  ) {
    curl.on('end', (status) => {
      const connection = this.parseConnection(curl)

      if (curl.isOpen) {
        curl.close()
      }

      if (!state.isResolved) {
        state.isResolved = true

        if (state.error) {
          resolve({
            error: state.error,
            connection
          })

          return
        }

        const responseHeaders = this.parseRawHeaders(state.responseHeaders)
        const responseBody = this.parseRawBody(state.responseBody)

        responseHeaders['content-length'] = responseBody.length.toString()
        responseHeaders['content-encoding'] = undefined

        resolve({
          error: null,
          status,
          responseHeaders,
          responseBody,
          connection
        })

        return
      }
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
      const connection = this.parseConnection(curl)

      if (curl.isOpen) {
        curl.close()
      }

      if (!state.isResolved) {
        state.isResolved = true

        const [code, message] = this.parseCurlCode(curlCode)

        const clientError = new HttpClientError(message, {
          cause: error,
          context: {
            reason: `Curl perform failed`,
            curlCode
          },
          code
        })

        resolve({
          error: clientError,
          connection
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
      if (state.isResolved || state.error) {
        stream.destroy()

        return
      }

      state.isResolved = true

      pipeline(stream, state.responseStream, (error) => {
        if (error) {
          this.logger.error(`HttpClient stream pipeline error`, { error })
        }
      })

      const responseHeaders = this.parseRawHeaders(state.responseHeaders)
      const connection = this.parseConnection(curl)

      responseHeaders['content-encoding'] = undefined

      resolve({
        error: null,
        status,
        responseHeaders,
        responseStream: state.responseStream,
        connection
      })
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
      const connection = this.parseConnection(curl)

      if (curl.isOpen) {
        curl.close()
      }

      if (!state.isResolved) {
        state.isResolved = true

        if (state.error) {
          if (!state.responseStream.destroyed) {
            state.responseStream.destroy(state.error)
          }

          resolve({
            error: state.error,
            connection
          })

          return
        }

        const clientError = new HttpClientError(`Bad gateway`, {
          context: {
            reason: `Curl stream event not triggered`
          },
          code: 'BAD_GATEWAY'
        })

        if (!state.responseStream.destroyed) {
          state.responseStream.destroy(clientError)
        }

        resolve({
          error: clientError,
          connection
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
      const connection = this.parseConnection(curl)

      if (curl.isOpen) {
        curl.close()
      }

      if (curlCode === CurlCode.CURLE_OPERATION_TIMEOUTED) {
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

        const clientError = new HttpClientError(message, {
          cause: error,
          context: {
            reason: `Curl perform failed`,
            curlCode
          },
          code
        })

        resolve({
          error: clientError,
          connection
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

  protected parseRawBody(chunks: Buffer[]): HttpBody {
    try {
      return Buffer.concat(chunks)
    } catch {
      return Buffer.alloc(0)
    }
  }

  protected parseCurlCode(curlCode: CurlCode): [HttpClientErrorCode, string] {
    return curlCode === CurlCode.CURLE_OPERATION_TIMEOUTED
      ? ['GATEWAY_TIMEOUT', 'Gateway timeout']
      : ['BAD_GATEWAY', 'Bad gateway']
  }

  private buildOptions(config: CurlHttpClientConfig): CurlHttpClientOptions {
    return {
      verbose: config.HTTP_CLIENT_VERBOSE
    }
  }
}

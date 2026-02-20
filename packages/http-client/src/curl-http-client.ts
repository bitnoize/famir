import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { HttpBody, HttpConnection, HttpHeaders, HttpKind, HttpMethod } from '@famir/http-tools'
import { Logger, LOGGER } from '@famir/logger'
import { Curl, CurlCode, CurlFeature } from 'node-libcurl'
import { PassThrough, Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { HttpClientError, HttpClientErrorCode } from './http-client.error.js'
import {
  CurlHttpClientConfig,
  CurlHttpClientOptions,
  HTTP_CLIENT,
  HttpClient,
  HttpClientSimpleRequest,
  HttpClientSimpleResponse,
  HttpClientStreamRequest,
  HttpClientStreamResponse
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

  simpleForward(request: HttpClientSimpleRequest): Promise<HttpClientSimpleResponse> {
    return new Promise<HttpClientSimpleResponse>((resolve) => {
      const curl = new Curl()

      const state: {
        error: HttpClientError | null
        isResolved: boolean
        responseHeaders: Buffer[]
        responseBody: Buffer[]
      } = {
        error: null,
        isResolved: false,
        responseHeaders: [],
        responseBody: []
      }

      this.setupCurlOptions(
        curl,
        'simple',
        request.connectTimeout,
        request.timeout,
        request.proxy,
        request.method,
        request.url,
        request.headers
      )

      this.setupCurlReadfunction(curl, state, request.body)

      this.setupCurlHeaderfunction(curl, state)

      this.setupCurlWritefunction(curl, state, request.bodyLimit)

      curl.on('end', (status) => {
        const connection = this.parseConnection(curl)

        curl.close()

        if (!state.isResolved) {
          state.isResolved = true

          if (state.error) {
            resolve({
              error: state.error,
              connection
            })
          } else {
            const headers = this.parseHeaders(state.responseHeaders)
            const body = this.parseBody(state.responseBody)

            headers['content-length'] = body.length.toString()
            headers['content-encoding'] = undefined

            resolve({
              error: null,
              status,
              headers,
              body,
              connection
            })
          }
        }
      })

      curl.on('error', (error: Error, curlCode: CurlCode) => {
        const connection = this.parseConnection(curl)

        curl.close()

        if (!state.isResolved) {
          state.isResolved = true

          const [code, message] = this.knownCurlCodes[curlCode] ?? [
            'INTERNAL_ERROR',
            `Client internal error`
          ]

          const clientError = new HttpClientError(message, {
            cause: error,
            context: {
              reason: `Curl request failed`,
              curlCode
            },
            code
          })

          resolve({
            error: clientError,
            connection
          })
        }
      })

      curl.perform()
    })
  }

  streamRequestForward(request: HttpClientStreamRequest): Promise<HttpClientSimpleResponse> {
    return new Promise<HttpClientSimpleResponse>((resolve) => {
      const curl = new Curl()

      const state: {
        error: HttpClientError | null
        isResolved: boolean
        responseHeaders: Buffer[]
        responseBody: Buffer[]
      } = {
        error: null,
        isResolved: false,
        responseHeaders: [],
        responseBody: []
      }

      this.setupCurlOptions(
        curl,
        'stream-request',
        request.connectTimeout,
        request.timeout,
        request.proxy,
        request.method,
        request.url,
        request.headers
      )

      this.setupCurlUploadStream(curl, state, request.stream)

      this.setupCurlHeaderfunction(curl, state)

      this.setupCurlWritefunction(curl, state, request.bodyLimit)

      curl.on('end', (status) => {
        const connection = this.parseConnection(curl)

        curl.close()

        if (!state.isResolved) {
          state.isResolved = true

          if (state.error) {
            resolve({
              error: state.error,
              connection
            })
          } else {
            const headers = this.parseHeaders(state.responseHeaders)
            const body = this.parseBody(state.responseBody)

            headers['content-length'] = body.length.toString()
            headers['content-encoding'] = undefined

            resolve({
              error: null,
              status,
              headers,
              body,
              connection
            })
          }
        }
      })

      curl.on('error', (error: Error, curlCode: CurlCode) => {
        const connection = this.parseConnection(curl)

        curl.close()

        if (!state.isResolved) {
          state.isResolved = true

          const [code, message] = this.knownCurlCodes[curlCode] ?? [
            'INTERNAL_ERROR',
            `Client internal error`
          ]

          const clientError = new HttpClientError(message, {
            cause: error,
            context: {
              reason: `Curl request failed`,
              curlCode
            },
            code
          })

          resolve({
            error: clientError,
            connection
          })
        }
      })

      curl.perform()
    })
  }

  streamResponseForward(request: HttpClientSimpleRequest): Promise<HttpClientStreamResponse> {
    return new Promise<HttpClientStreamResponse>((resolve) => {
      const curl = new Curl()

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

      this.setupCurlOptions(
        curl,
        'stream-response',
        request.connectTimeout,
        request.timeout,
        request.proxy,
        request.method,
        request.url,
        request.headers
      )

      this.setupCurlReadfunction(curl, state, request.body)

      this.setupCurlHeaderfunction(curl, state)

      curl.on('stream', (stream, status) => {
        pipeline(stream, state.responseStream).catch((error) => {
          state.responseStream.destroy(error)
        })

        if (!state.isResolved) {
          state.isResolved = true

          const connection = this.parseConnection(curl)
          const headers = this.parseHeaders(state.responseHeaders)

          resolve({
            error: null,
            status,
            headers,
            stream: state.responseStream,
            connection
          })
        }
      })

      curl.on('end', (status) => {
        const connection = this.parseConnection(curl)
        const headers = this.parseHeaders(state.responseHeaders)

        curl.close()

        if (!state.isResolved) {
          state.isResolved = true

          state.responseStream.end()

          resolve({
            error: null,
            status,
            headers,
            stream: state.responseStream,
            connection
          })
        }
      })

      curl.on('error', (error: Error, curlCode: CurlCode) => {
        const connection = this.parseConnection(curl)

        curl.close()

        if (!state.isResolved) {
          state.isResolved = true

          state.responseStream.destroy(error)

          const [code, message] = this.knownCurlCodes[curlCode] ?? [
            'INTERNAL_ERROR',
            `Client internal error`
          ]

          const clientError = new HttpClientError(message, {
            cause: error,
            context: {
              reason: `Curl request failed`,
              curlCode
            },
            code
          })

          resolve({
            error: clientError,
            connection
          })
        }
      })

      curl.perform()
    })
  }

  protected setupCurlOptions(
    curl: Curl,
    kind: HttpKind,
    connectTimeout: number,
    timeout: number,
    proxy: string,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders
  ) {
    curl.enable(CurlFeature.NoStorage)

    if (kind === 'stream-response') {
      curl.enable(CurlFeature.StreamResponse)
    }

    if (this.options.verbose) {
      curl.setOpt(Curl.option.VERBOSE, true)
    }

    curl.setOpt(Curl.option.DNS_USE_GLOBAL_CACHE, 1)

    curl.setOpt(Curl.option.CONNECTTIMEOUT_MS, connectTimeout)
    curl.setOpt(Curl.option.TIMEOUT_MS, timeout) // Entire request timeout

    curl.setOpt(Curl.option.PROXY, proxy)

    curl.setOpt(Curl.option.CUSTOMREQUEST, method)
    curl.setOpt(Curl.option.URL, url)

    curl.setOpt(Curl.option.HTTPHEADER, this.formatHeaders(requestHeaders))
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
        state.error = new HttpClientError(`Client internal error`, {
          cause: error,
          context: {
            reason: `Curl READFUNCTION callback failed`
          },
          code: 'INTERNAL_ERROR'
        })

        return 0
      }
    })
  }

  protected setupCurlUploadStream(
    curl: Curl,
    state: {
      isResolved: boolean
    },
    requestStream: Readable
  ) {
    curl.setOpt(Curl.option.UPLOAD, true)

    if (!state.isResolved) {
      curl.setUploadStream(requestStream)
    }
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
        state.error = new HttpClientError(`Client internal error`, {
          cause: error,
          context: {
            reason: `Curl HEADERFUNCTION callback failed`
          },
          code: 'INTERNAL_ERROR'
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
    },
    bodyLimit: number
  ) {
    let responseBodySize = 0

    curl.setOpt(Curl.option.WRITEFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
      try {
        if (state.error) {
          return 0
        }

        const chunkSize = size * nmemb
        const chunk = buf.subarray(0, chunkSize)

        if (responseBodySize + chunkSize > bodyLimit) {
          state.error = new HttpClientError(`Bad gateway`, {
            context: {
              reason: `Response body size limit exceeded`,
              responseBodySize,
              bodyLimit
            },
            code: 'BAD_GATEWAY'
          })

          return 0
        } else {
          state.responseBody.push(chunk)
          responseBodySize += chunkSize

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

  protected knownCurlCodes: Record<number, [HttpClientErrorCode, string]> = {
    5: ['BAD_GATEWAY', `Bad gateway`], // COULDNT_RESOLVE_PROXY
    6: ['BAD_GATEWAY', `Bad gateway`], // COULDNT_RESOLVE_HOST
    7: ['BAD_GATEWAY', `Bad gateway`], // COULDNT_CONNECT
    28: ['GATEWAY_TIMEOUT', `Gateway timeout`], // OPERATION_TIMEDOUT
    35: ['BAD_GATEWAY', `Bad gateway`] //SSL_CONNECT_ERROR
  }

  protected parseHeaders(curlHeaders: Buffer[]): HttpHeaders {
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

  protected formatHeaders(headers: HttpHeaders): string[] {
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

  protected parseBody(curlBody: Buffer[]): HttpBody {
    return Buffer.concat(curlBody)
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

  private buildOptions(config: CurlHttpClientConfig): CurlHttpClientOptions {
    return {
      verbose: config.HTTP_CLIENT_VERBOSE
    }
  }
}

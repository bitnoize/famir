import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { HttpBody, HttpConnection, HttpHeaders, HttpMethod } from '@famir/http-proto'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { Curl, CurlCode, CurlFeature } from 'node-libcurl'
import { PassThrough, pipeline, Readable } from 'node:stream'
import { HttpClientError } from './http-client.error.js'
import {
  HTTP_CLIENT,
  HttpClient,
  HttpClientSimpleResult,
  HttpClientSimpleState,
  HttpClientStreamRequestState,
  HttpClientStreamResponseState,
  HttpClientStreamResult,
} from './http-client.js'

/**
 * Curl-based http-client implementation.
 *
 * Uses the high-performance libcurl library via the node-libcurl bindings.
 *
 * @see https://github.com/JCMais/node-libcurl - node-libcurl bindings
 * @see https://curl.se/libcurl/c/ - libcurl documentation
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - {@link Logger} via {@link LOGGER} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { HTTP_CLIENT, HttpClient, CurlHttpClient } from '@famir/http-client'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * CurlHttpClient.register(container)
 *
 * // Resolve dependency from container
 * const httpClient = container.resolve<HttpClient>(HTTP_CLIENT)
 *
 * // TODO more examples
 * ```
 */
export class CurlHttpClient implements HttpClient {
  /**
   * Registers the http-client as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<HttpClient>(
      HTTP_CLIENT,
      (c) =>
        new CurlHttpClient(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  /**
   * Creates a new http-client instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config,
    protected readonly logger: Logger
  ) {}

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
  ): Promise<HttpClientSimpleResult> {
    return new Promise((resolve) => {
      const state: HttpClientSimpleState = {
        error: null,
        settled: false,
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
        bodySizeLimit,
      }

      const curl = new Curl()

      curl.enable(CurlFeature.NoStorage)

      this.setupCurlOptions(curl, state)

      this.setupCurlReadfunction(curl, state)
      this.setupCurlHeaderfunction(curl, state)
      this.setupCurlWritefunction(curl, state)

      this.setupCurlSimpleEndEvent(curl, state, resolve)
      this.setupCurlSimpleErrorEvent(curl, state, resolve)

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
  ): Promise<HttpClientSimpleResult> {
    return new Promise((resolve) => {
      const state: HttpClientStreamRequestState = {
        error: null,
        settled: false,
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
        bodySizeLimit,
      }

      const curl = new Curl()

      curl.enable(CurlFeature.NoStorage)

      this.setupCurlOptions(curl, state)

      this.setupCurlUploadStream(curl, state)
      this.setupCurlHeaderfunction(curl, state)
      this.setupCurlWritefunction(curl, state)

      this.setupCurlSimpleEndEvent(curl, state, resolve)
      this.setupCurlSimpleErrorEvent(curl, state, resolve)

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
  ): Promise<HttpClientStreamResult> {
    return new Promise((resolve) => {
      const state: HttpClientStreamResponseState = {
        error: null,
        settled: false,
        proxy,
        method,
        url,
        requestHeaders,
        requestBody,
        responseHeaders: [],
        responseStream: new PassThrough(),
        connectTimeout,
        timeout,
        headersSizeLimit,
      }

      const curl = new Curl()

      curl.enable(CurlFeature.StreamResponse)
      curl.enable(CurlFeature.NoStorage)

      this.setupCurlOptions(curl, state)

      this.setupCurlReadfunction(curl, state)
      this.setupCurlHeaderfunction(curl, state)

      this.setupCurlStreamEvent(curl, state, resolve)
      this.setupCurlStreamEndEvent(curl, state, resolve)
      this.setupCurlStreamErrorEvent(curl, state, resolve)

      curl.perform()
    })
  }

  /**
   * Configures common curl options for all request types.
   */
  private setupCurlOptions(
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
    //curl.setOpt(Curl.option.VERBOSE, true)

    curl.setOpt(Curl.option.DNS_USE_GLOBAL_CACHE, 1)

    curl.setOpt(Curl.option.PROXY, state.proxy)

    curl.setOpt(Curl.option.CUSTOMREQUEST, state.method)
    curl.setOpt(Curl.option.URL, state.url)

    curl.setOpt(Curl.option.HTTPHEADER, this.formatRawHeaders(state.requestHeaders))
    curl.setOpt(Curl.option.ACCEPT_ENCODING, '') // Means all encodings!

    if (state.connectTimeout > 0) {
      curl.setOpt(Curl.option.CONNECTTIMEOUT_MS, state.connectTimeout)
    }

    if (state.timeout > 0) {
      curl.setOpt(Curl.option.TIMEOUT_MS, state.timeout)
    }
  }

  /**
   * Sets up the read function for uploading a request body from a buffer.
   */
  private setupCurlReadfunction(
    curl: Curl,
    state: {
      error: HttpClientError | null
      requestBody: HttpBody
    }
  ) {
    const requestBodySize = state.requestBody.length
    let requestBodyOffset = 0

    curl.setOpt(Curl.option.UPLOAD, true)
    curl.setOpt(Curl.option.INFILESIZE_LARGE, requestBodySize)
    curl.setOpt(Curl.option.READFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
      try {
        if (state.error) {
          return 0
        }

        const chunkSize = Math.min(size * nmemb, requestBodySize - requestBodyOffset)

        if (chunkSize <= 0) {
          return 0
        }

        state.requestBody.copy(buf, 0, requestBodyOffset, requestBodyOffset + chunkSize)

        requestBodyOffset += chunkSize

        return chunkSize
      } catch (error) {
        state.error = HttpClientError.badGateway(
          `Bad gateway`,
          {
            reason: `Curl READFUNCTION failed`,
          },
          error
        )

        return 0
      }
    })
  }

  /**
   * Sets up the upload stream for streaming request bodies.
   */
  private setupCurlUploadStream(
    curl: Curl,
    state: {
      error: HttpClientError | null
      requestStream: Readable
    }
  ) {
    /*
    if (state.requestStream.destroyed) {
      state.error ??= HttpClientError.badGateway(`Bad gateway`, {
        reason: `Request stream is already destroyed`,
      })

      return
    }

    state.requestStream.on('error', (error) => {
      state.error ??= HttpClientError.badGateway(
        `Bad gateway`,
        {
          reason: `Request stream error`,
        },
        error
      )
    })
    */

    curl.setOpt(Curl.option.UPLOAD, true)

    curl.setUploadStream(state.requestStream)
  }

  /**
   * Sets up the header function for capturing response headers.
   */
  private setupCurlHeaderfunction(
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
          state.error = HttpClientError.badGateway(`Bad gateway`, {
            reason: `Response headers size limit exceeded`,
            headersSizeLimit: state.headersSizeLimit,
            responseHeadersSize,
            chunkSize,
          })

          return 0
        }

        const chunk = buf.subarray(0, chunkSize)
        state.responseHeaders.push(chunk)

        responseHeadersSize += chunkSize

        return chunkSize
      } catch (error) {
        state.error = HttpClientError.badGateway(
          `Bad gateway`,
          {
            reason: `Curl HEADERFUNCTION failed`,
          },
          error
        )

        return 0
      }
    })
  }

  /**
   * Sets up the write function for downloading response bodies to buffer.
   */
  private setupCurlWritefunction(
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
          state.error = HttpClientError.badGateway(`Bad gateway`, {
            reason: `Response body size limit exceeded`,
            bodySizeLimit: state.bodySizeLimit,
            responseBodySize,
            chunkSize,
          })

          return 0
        }

        const chunk = buf.subarray(0, chunkSize)
        state.responseBody.push(chunk)

        responseBodySize += chunkSize

        return chunkSize
      } catch (error) {
        state.error = HttpClientError.badGateway(
          `Bad gateway`,
          {
            reason: `Curl WRITEFUNCTION failed`,
          },
          error
        )

        return 0
      }
    })
  }

  /**
   * Sets up the end event handler for simple requests.
   */
  private setupCurlSimpleEndEvent(
    curl: Curl,
    state: {
      error: HttpClientError | null
      settled: boolean
      responseHeaders: Buffer[]
      responseBody: Buffer[]
    },
    resolve: (value: HttpClientSimpleResult) => void
  ) {
    curl.on('end', (status) => {
      const connection = this.parseConnection(curl)

      if (curl.isOpen) {
        curl.close()
      }

      if (state.settled) {
        return
      }

      state.settled = true

      const responseHeaders = this.parseRawHeaders(state.responseHeaders)
      const responseBody = this.parseRawBody(state.responseBody)

      responseHeaders['content-length'] = responseBody.length.toString()
      responseHeaders['content-encoding'] = undefined

      if (state.error) {
        resolve({
          error: state.error,
          status: state.error.status,
          responseHeaders,
          responseBody,
          connection,
        })

        return
      }

      resolve({
        error: null,
        status,
        responseHeaders,
        responseBody,
        connection,
      })
    })
  }

  /**
   * Sets up the error event handler for simple requests.
   */
  private setupCurlSimpleErrorEvent(
    curl: Curl,
    state: {
      error: HttpClientError | null
      settled: boolean
      responseHeaders: Buffer[]
      responseBody: Buffer[]
    },
    resolve: (value: HttpClientSimpleResult) => void
  ) {
    curl.on('error', (error: Error, curlCode: CurlCode) => {
      const connection = this.parseConnection(curl)

      if (curl.isOpen) {
        curl.close()
      }

      if (state.settled) {
        return
      }

      state.settled = true

      const responseHeaders = this.parseRawHeaders(state.responseHeaders)
      const responseBody = this.parseRawBody(state.responseBody)

      responseHeaders['content-length'] = responseBody.length.toString()
      responseHeaders['content-encoding'] = undefined

      if (state.error) {
        resolve({
          error: state.error,
          status: state.error.status,
          responseHeaders,
          responseBody,
          connection,
        })

        return
      }

      if (curlCode === CurlCode.CURLE_OPERATION_TIMEOUTED) {
        const clientError = HttpClientError.gatewayTimeout(`Gateway timeout`)

        resolve({
          error: clientError,
          status: clientError.status,
          responseHeaders,
          responseBody,
          connection,
        })

        return
      }

      const clientError = HttpClientError.badGateway(
        `Bad gateway`,
        {
          reason: `Curl perform failed`,
          curlCode: CurlCode[curlCode],
        },
        error
      )

      resolve({
        error: clientError,
        status: clientError.status,
        responseHeaders,
        responseBody,
        connection,
      })
    })
  }

  /**
   * Sets up the stream event handler for streaming responses.
   */
  private setupCurlStreamEvent(
    curl: Curl,
    state: {
      error: HttpClientError | null
      settled: boolean
      responseHeaders: Buffer[]
      responseStream: PassThrough
    },
    resolve: (value: HttpClientStreamResult) => void
  ) {
    curl.on('stream', (stream, status) => {
      const connection = this.parseConnection(curl)

      if (state.settled) {
        if (!stream.destroyed) {
          stream.destroy()
        }

        if (!state.responseStream.destroyed) {
          state.responseStream.destroy()
        }

        return
      }

      state.settled = true

      const responseHeaders = this.parseRawHeaders(state.responseHeaders)

      responseHeaders['content-length'] = undefined
      responseHeaders['content-encoding'] = undefined

      if (state.error) {
        if (!stream.destroyed) {
          stream.destroy()
        }

        if (!state.responseStream.destroyed) {
          state.responseStream.destroy()
        }

        resolve({
          error: state.error,
          status: state.error.status,
          responseHeaders,
          responseStream: state.responseStream,
          connection,
        })

        return
      }

      pipeline(stream, state.responseStream, (error) => {
        if (error) {
          this.logger.warn(`HttpClient stream pipeline error`, { error })
        }
      })

      resolve({
        error: null,
        status,
        responseHeaders,
        responseStream: state.responseStream,
        connection,
      })
    })
  }

  /**
   * Sets up the end event handler for streaming responses.
   */
  private setupCurlStreamEndEvent(
    curl: Curl,
    state: {
      error: HttpClientError | null
      settled: boolean
      responseHeaders: Buffer[]
      responseStream: PassThrough
    },
    resolve: (value: HttpClientStreamResult) => void
  ) {
    curl.on('end', () => {
      const connection = this.parseConnection(curl)

      if (curl.isOpen) {
        curl.close()
      }

      if (state.settled) {
        if (!state.responseStream.destroyed) {
          state.responseStream.destroy()
        }

        return
      }

      state.settled = true

      const responseHeaders = this.parseRawHeaders(state.responseHeaders)

      responseHeaders['content-length'] = undefined
      responseHeaders['content-encoding'] = undefined

      if (state.error) {
        if (!state.responseStream.destroyed) {
          state.responseStream.destroy()
        }

        resolve({
          error: state.error,
          status: state.error.status,
          responseHeaders,
          responseStream: state.responseStream,
          connection,
        })

        return
      }

      if (!state.responseStream.destroyed) {
        state.responseStream.destroy()
      }

      const clientError = HttpClientError.badGateway(`Bad gateway`, {
        reason: `Curl stream event not triggered`,
      })

      resolve({
        error: clientError,
        status: clientError.status,
        responseHeaders,
        responseStream: state.responseStream,
        connection,
      })
    })
  }

  /**
   * Sets up the error event handler for streaming responses.
   */
  private setupCurlStreamErrorEvent(
    curl: Curl,
    state: {
      error: HttpClientError | null
      settled: boolean
      responseHeaders: Buffer[]
      responseStream: PassThrough
    },
    resolve: (value: HttpClientStreamResult) => void
  ) {
    curl.on('error', (error: Error, curlCode: CurlCode) => {
      const connection = this.parseConnection(curl)

      if (curl.isOpen) {
        curl.close()
      }

      if (state.settled) {
        if (!state.responseStream.destroyed) {
          state.responseStream.destroy(error)
        }

        return
      }

      state.settled = true

      const responseHeaders = this.parseRawHeaders(state.responseHeaders)

      responseHeaders['content-length'] = undefined
      responseHeaders['content-encoding'] = undefined

      if (curlCode === CurlCode.CURLE_OPERATION_TIMEOUTED) {
        if (!state.responseStream.writableEnded && !state.responseStream.destroyed) {
          state.responseStream.end()
        }

        resolve({
          error: null,
          status: 200,
          responseHeaders,
          responseStream: state.responseStream,
          connection,
        })

        return
      }

      if (!state.responseStream.destroyed) {
        state.responseStream.destroy(error)
      }

      const clientError = HttpClientError.badGateway(
        `Bad gateway`,
        {
          reason: `Curl perform failed`,
          curlCode: CurlCode[curlCode],
        },
        error
      )

      resolve({
        error: clientError,
        status: clientError.status,
        responseHeaders,
        responseStream: state.responseStream,
        connection,
      })
    })
  }

  /**
   * Parses connection information from a curl instance.
   */
  private parseConnection(curl: Curl): HttpConnection {
    try {
      const totalTime = curl.getInfo('TOTAL_TIME_T')
      const connectTime = curl.getInfo('CONNECT_TIME_T')
      const httpVersion = curl.getInfo('HTTP_VERSION')
      const versionInfo = Curl.getVersionInfo()

      return {
        client_total_time: typeof totalTime === 'number' ? totalTime : null,
        client_connect_time: typeof connectTime === 'number' ? connectTime : null,
        client_http_version: typeof httpVersion === 'number' ? httpVersion : null,
        client_version_info: versionInfo.version,
      }
    } catch {
      return {
        client_total_time: null,
        client_connect_time: null,
        client_http_version: null,
        client_version_info: null,
      }
    }
  }

  /**
   * Parses raw header buffers into a key-value object.
   */
  private parseRawHeaders(curlHeaders: Buffer[]): HttpHeaders {
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

  /**
   * Formats headers into a string array for curl.
   */
  private formatRawHeaders(headers: HttpHeaders): string[] {
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

  /**
   * Concatenates buffer chunks into a single Buffer.
   */
  private parseRawBody(chunks: Buffer[]): HttpBody {
    try {
      return Buffer.concat(chunks)
    } catch {
      return Buffer.alloc(0)
    }
  }
}

import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { HttpBody, HttpConnection, HttpHeaders, HttpMethod } from '@famir/http-proto'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { Curl, CurlCode, CurlFeature } from 'node-libcurl'
import { PassThrough, pipeline, Readable } from 'node:stream'
import { HttpClientError, HttpClientErrorCode } from './http-client.error.js'
import {
  CurlHttpClientConfig,
  HTTP_CLIENT,
  HttpClient,
  HttpClientErrorResult,
  HttpClientSimpleResult,
  HttpClientSimpleState,
  HttpClientStreamRequestState,
  HttpClientStreamResponseState,
  HttpClientStreamResult,
} from './http-client.js'
import { curlHttpClientConfigSchema } from './http-client.schemas.js'

/**
 * Options for a Curl http-client.
 */
interface CurlHttpClientOptions {
  verbose: boolean
}

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

  /** Built http-client options. */
  protected readonly options: CurlHttpClientOptions

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
  ) {
    this.validator.addSchema('http-client-config', curlHttpClientConfigSchema)

    const configData = this.config.get<CurlHttpClientConfig>('http-client-config')
    this.options = this.buildOptions(configData)
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
    return new Promise((resolve, reject) => {
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
        bodySizeLimit,
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
    return new Promise((resolve, reject) => {
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
        bodySizeLimit,
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
    return new Promise((resolve, reject) => {
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
        headersSizeLimit,
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

  /**
   * Configures common curl options for all request types.
   *
   * @param curl - The curl instance.
   * @param state - The request state.
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

  /**
   * Sets up the read function for uploading a request body from a buffer.
   *
   * @param curl - The curl instance.
   * @param state - The request state.
   */
  private setupCurlReadfunction(
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
            reason: `Curl READFUNCTION callback failed`,
          },
          code: 'BAD_GATEWAY',
        })

        return 0
      }
    })
  }

  /**
   * Sets up the upload stream for streaming request bodies.
   *
   * @param curl - The curl instance.
   * @param state - The request state.
   */
  private setupCurlUploadStream(
    curl: Curl,
    state: {
      requestStream: Readable
    }
  ) {
    curl.setOpt(Curl.option.UPLOAD, true)

    curl.setUploadStream(state.requestStream)
  }

  /**
   * Sets up the header function for capturing response headers.
   *
   * @param curl - The curl instance.
   * @param state - The request state.
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
          state.error = new HttpClientError('Bad gateway', {
            context: {
              reason: `Response headers size limit exceeded`,
            },
            code: 'BAD_GATEWAY',
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
            reason: `Curl HEADERFUNCTION callback failed`,
          },
          code: 'BAD_GATEWAY',
        })

        return 0
      }
    })
  }

  /**
   * Sets up the write function for downloading response bodies to buffer.
   *
   * @param curl - The curl instance.
   * @param state - The request state.
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
          state.error = new HttpClientError(`Bad gateway`, {
            context: {
              reason: `Response body size limit exceeded`,
            },
            code: 'BAD_GATEWAY',
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
            reason: `Curl WRITEFUNCTION callback failed`,
          },
          code: 'BAD_GATEWAY',
        })

        return 0
      }
    })
  }

  /**
   * Sets up the end event handler for simple requests.
   *
   * @param curl - The curl instance.
   * @param state - The request state.
   * @param resolve - The promise resolve function.
   * @param reject - The promise reject function.
   */
  private setupCurlSimpleEndEvent(
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
            connection,
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
          connection,
        })

        return
      }
    })
  }

  /**
   * Sets up the error event handler for simple requests.
   *
   * @param curl - The curl instance.
   * @param state - The request state.
   * @param resolve - The promise resolve function.
   * @param reject - The promise reject function.
   */
  private setupCurlSimpleErrorEvent(
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
            curlCode,
          },
          code,
        })

        resolve({
          error: clientError,
          connection,
        })

        return
      }
    })
  }

  /**
   * Sets up the stream event handler for streaming responses.
   *
   * @param curl - The curl instance.
   * @param state - The request state.
   * @param resolve - The promise resolve function.
   * @param reject - The promise reject function.
   */
  private setupCurlStreamEvent(
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
          this.logger.warn(`HttpClient stream pipeline error`, { error })
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
        connection,
      })
    })
  }

  /**
   * Sets up the end event handler for streaming responses.
   *
   * @param curl - The curl instance.
   * @param state - The request state.
   * @param resolve - The promise resolve function.
   * @param reject - The promise reject function.
   */
  private setupCurlStreamEndEvent(
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
            connection,
          })

          return
        }

        const clientError = new HttpClientError(`Bad gateway`, {
          context: {
            reason: `Curl stream event not triggered`,
          },
          code: 'BAD_GATEWAY',
        })

        if (!state.responseStream.destroyed) {
          state.responseStream.destroy(clientError)
        }

        resolve({
          error: clientError,
          connection,
        })

        return
      }
    })
  }

  /**
   * Sets up the error event handler for streaming responses.
   *
   * @param curl - The curl instance.
   * @param state - The request state.
   * @param resolve - The promise resolve function.
   * @param reject - The promise reject function.
   */
  private setupCurlStreamErrorEvent(
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
            curlCode,
          },
          code,
        })

        resolve({
          error: clientError,
          connection,
        })

        return
      }
    })
  }

  /**
   * Parses connection information from a curl instance.
   *
   * @param curl - The curl instance.
   * @returns The connection details.
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
   *
   * @param curlHeaders - The raw header buffers from curl.
   * @returns The parsed headers object.
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
   *
   * @param headers - The headers object to format.
   * @returns The formatted header strings.
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
   *
   * @param chunks - The buffer chunks to concatenate.
   * @returns The concatenated buffer, or an empty buffer on error.
   */
  private parseRawBody(chunks: Buffer[]): HttpBody {
    try {
      return Buffer.concat(chunks)
    } catch {
      return Buffer.alloc(0)
    }
  }

  /**
   * Parses a curl error code into an http-client error code and message.
   *
   * @param curlCode - The curl error code.
   * @returns The tuple containing the error code and message.
   */
  private parseCurlCode(curlCode: CurlCode): [HttpClientErrorCode, string] {
    return curlCode === CurlCode.CURLE_OPERATION_TIMEOUTED
      ? ['GATEWAY_TIMEOUT', 'Gateway timeout']
      : ['BAD_GATEWAY', 'Bad gateway']
  }

  /**
   * Converts validated configuration to an http-client options.
   *
   * @param data - The validated configuration object.
   * @returns The http-client options object.
   */
  private buildOptions(data: CurlHttpClientConfig): CurlHttpClientOptions {
    return {
      verbose: data.HTTP_CLIENT_VERBOSE,
    }
  }
}

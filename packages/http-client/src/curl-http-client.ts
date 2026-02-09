import { DIContainer, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  HTTP_CLIENT,
  HttpBody,
  HttpClient,
  HttpClientError,
  HttpClientOrdinaryRequest,
  HttpClientOrdinaryResponse,
  HttpClientStreamingRequest,
  HttpClientStreamingResponse,
  HttpConnection,
  HttpHeaders,
  Logger,
  LOGGER
} from '@famir/domain'
import { Curl, CurlCode, CurlFeature } from 'node-libcurl'
import { CurlHttpClientConfig, CurlHttpClientOptions } from './http-client.js'

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

  ordinaryRequest(request: HttpClientOrdinaryRequest): Promise<HttpClientOrdinaryResponse> {
    return new Promise<HttpClientOrdinaryResponse>((resolve, reject) => {
      const curl = new Curl()

      let cancelCode: string | null = null

      curl.enable(CurlFeature.NoStorage)

      if (this.options.verbose) {
        curl.setOpt(Curl.option.VERBOSE, true)
      }

      curl.setOpt(Curl.option.DNS_USE_GLOBAL_CACHE, 1)

      curl.setOpt(Curl.option.CONNECTTIMEOUT_MS, request.connectTimeout)
      curl.setOpt(Curl.option.TIMEOUT_MS, request.timeout)

      curl.setOpt(Curl.option.PROXY, request.proxy)

      curl.setOpt(Curl.option.CUSTOMREQUEST, request.method)
      curl.setOpt(Curl.option.URL, request.url)

      curl.setOpt(Curl.option.HTTPHEADER, this.formatHeaders(request.headers))
      curl.setOpt(Curl.option.ACCEPT_ENCODING, '') // Means all encodings!

      if (request.body.length > 0) {
        curl.setOpt(Curl.option.UPLOAD, true)
        curl.setOpt(Curl.option.INFILESIZE_LARGE, request.body.length)

        let requestBodyOffset = 0
        curl.setOpt(Curl.option.READFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
          try {
            if (cancelCode != null) {
              return 0
            }

            const chunkSize = Math.min(size * nmemb, request.body.length - requestBodyOffset)

            if (chunkSize <= 0) {
              return 0
            }

            request.body.copy(buf, 0, requestBodyOffset, requestBodyOffset + chunkSize)

            requestBodyOffset += chunkSize

            return chunkSize
          } catch (error) {
            this.logger.error(`HttpClient Curl READFUNCTION error`, {
              error: serializeError(error)
            })

            cancelCode = 'READFUNCTION_ERROR'

            return 0
          }
        })
      }

      curl.setOpt(Curl.option.HEADER, false)

      const responseHeaders: Buffer[] = []

      curl.setOpt(Curl.option.HEADERFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
        try {
          if (cancelCode != null) {
            return 0
          }

          const chunkSize = size * nmemb
          const chunk = buf.subarray(0, chunkSize)

          responseHeaders.push(chunk)

          return chunkSize
        } catch (error) {
          this.logger.error(`HttpClient Curl HEADERFUNCTION error`, {
            error: serializeError(error)
          })

          cancelCode = 'HEADERFUNCTION_ERROR'

          return 0
        }
      })

      //curl.setOpt(Curl.option.NOBODY, false)

      const responseBody: Buffer[] = []
      let responseBodySize = 0

      curl.setOpt(Curl.option.WRITEFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
        try {
          if (cancelCode != null) {
            return 0
          }

          const chunkSize = size * nmemb
          const chunk = buf.subarray(0, chunkSize)

          if (responseBodySize + chunkSize > request.bodyLimit) {
            cancelCode = 'CONTENT_TOO_LARGE'

            return 0
          }

          responseBody.push(chunk)

          responseBodySize += chunkSize

          return chunkSize
        } catch (error) {
          this.logger.error(`HttpClient Curl WRITEFUNCTION error`, {
            error: serializeError(error)
          })

          cancelCode = 'WRITEFUNCTION_ERROR'

          return 0
        }
      })

      curl.on('end', (status: number) => {
        try {
          const connection = this.parseConnection(curl)

          curl.close()

          if (cancelCode != null) {
            const error = new HttpClientError(`Request canceled`, {
              context: {
                cancelCode
              },
              code: 'INTERNAL_ERROR'
            })

            resolve({
              error,
              status: this.knownCancelCodes[cancelCode] ?? 500,
              headers: {},
              body: Buffer.alloc(0),
              connection
            })

            return
          }

          const response: HttpClientOrdinaryResponse = {
            error: null,
            status,
            headers: this.parseHeaders(responseHeaders),
            body: this.parseBody(responseBody),
            connection
          }

          response.headers['content-length'] = response.body.length.toString()
          response.headers['content-encoding'] = undefined

          resolve(response)
        } catch (error) {
          reject(
            new HttpClientError(`Parse response error`, {
              cause: error,
              context: {
                status
              },
              code: 'INTERNAL_ERROR'
            })
          )
        }
      })

      curl.on('error', (error: Error, curlCode: CurlCode) => {
        try {
          const connection = this.parseConnection(curl)

          curl.close()

          resolve({
            error,
            status: this.knownCurlCodes[curlCode] ?? 500,
            headers: {},
            body: Buffer.alloc(0),
            connection
          })
        } catch (criticalError) {
          reject(
            new HttpClientError(`Request critical error`, {
              cause: criticalError,
              context: {
                error,
                curlCode
              },
              code: 'INTERNAL_ERROR'
            })
          )
        }
      })

      curl.perform()
    })
  }

  streamingRequest(request: HttpClientStreamingRequest): Promise<HttpClientStreamingResponse> {
    return new Promise<HttpClientStreamingResponse>((resolve, reject) => {
      reject(new Error(`Streaming request not supported yet`))
    })
  }

  protected knownCancelCodes: Record<string, number> = {
    CONTENT_TOO_LARGE: 502
  }

  protected knownCurlCodes: Record<number, number> = {
    5: 502, // COULDNT_RESOLVE_PROXY
    6: 502, // COULDNT_RESOLVE_HOST
    7: 502, // COULDNT_CONNECT
    28: 504, // OPERATION_TIMEDOUT
    35: 502 //SSL_CONNECT_ERROR
  }

  protected parseConnection(curl: Curl): HttpConnection {
    const totalTime = curl.getInfo('TOTAL_TIME_T')
    const connectTime = curl.getInfo('CONNECT_TIME_T')
    const httpVersion = curl.getInfo('HTTP_VERSION')

    return {
      client_total_time: typeof totalTime === 'number' ? totalTime : null,
      client_connect_time: typeof connectTime === 'number' ? connectTime : null,
      client_http_version: typeof httpVersion === 'number' ? httpVersion : null
    }
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

  private buildOptions(config: CurlHttpClientConfig): CurlHttpClientOptions {
    return {
      verbose: config.HTTP_CLIENT_VERBOSE,
      errorPage: config.HTTP_CLIENT_ERROR_PAGE
    }
  }
}

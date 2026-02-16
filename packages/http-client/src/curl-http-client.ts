import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { HttpBody, HttpConnection, HttpHeaders } from '@famir/http-tools'
import { Logger, LOGGER } from '@famir/logger'
import { Curl, CurlCode, CurlFeature } from 'node-libcurl'
import { HttpClientError, HttpClientErrorCode } from './http-client.error.js'
import {
  CurlHttpClientConfig,
  CurlHttpClientOptions,
  HTTP_CLIENT,
  HttpClient,
  HttpClientRequest,
  HttpClientSimpleResponse,
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

  simpleForward(request: HttpClientRequest): Promise<HttpClientSimpleResponse> {
    return new Promise<HttpClientSimpleResponse>((resolve, reject) => {
      const curl = new Curl()

      let cancelError: HttpClientError | null = null

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
            if (cancelError != null) {
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
            cancelError = new HttpClientError(`Client internal error`, {
              cause: error,
              context: {
                curlFun: 'READFUNCTION'
              },
              code: 'INTERNAL_ERROR'
            })

            return 0
          }
        })
      }

      curl.setOpt(Curl.option.HEADER, false)

      const responseHeaders: Buffer[] = []

      curl.setOpt(Curl.option.HEADERFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
        try {
          if (cancelError != null) {
            return 0
          }

          const chunkSize = size * nmemb
          const chunk = buf.subarray(0, chunkSize)

          responseHeaders.push(chunk)

          return chunkSize
        } catch (error) {
          cancelError = new HttpClientError(`Client internal error`, {
            cause: error,
            context: {
              curlFun: 'HEADERFUNCTION'
            },
            code: 'INTERNAL_ERROR'
          })

          return 0
        }
      })

      const responseBody: Buffer[] = []
      let responseBodySize = 0

      curl.setOpt(Curl.option.WRITEFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
        try {
          if (cancelError != null) {
            return 0
          }

          const chunkSize = size * nmemb
          const chunk = buf.subarray(0, chunkSize)

          if (responseBodySize + chunkSize > request.bodyLimit) {
            cancelError = new HttpClientError(`Content too large`, {
              code: 'BAD_GATEWAY'
            })

            return 0
          }

          responseBody.push(chunk)
          responseBodySize += chunkSize

          return chunkSize
        } catch (error) {
          cancelError = new HttpClientError(`Client internal error`, {
            cause: error,
            context: {
              curlFun: 'WRITEFUNCTION'
            },
            code: 'INTERNAL_ERROR'
          })

          return 0
        }
      })

      curl.on('end', (status: number) => {
        try {
          const connection = this.parseConnection(curl)

          curl.close()

          if (cancelError != null) {
            resolve({
              error: cancelError,
              status: 0,
              headers: {},
              body: Buffer.alloc(0),
              connection
            })

            return
          }

          const response: HttpClientSimpleResponse = {
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
            new HttpClientError(`Client internal error`, {
              cause: error,
              code: 'INTERNAL_ERROR'
            })
          )
        }
      })

      curl.on('error', (error: Error, curlCode: CurlCode) => {
        try {
          const connection = this.parseConnection(curl)

          curl.close()

          const [code, message] = this.knownCurlCodes[curlCode] ?? [
            'INTERNAL_ERROR',
            `Client internal error`
          ]

          const clientError = new HttpClientError(message, {
            cause: error,
            context: {
              curlCode
            },
            code
          })

          resolve({
            error: clientError,
            status: 0,
            headers: {},
            body: Buffer.alloc(0),
            connection
          })
        } catch (criticalError) {
          reject(
            new HttpClientError(`Client critical error`, {
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

  streamForward(request: HttpClientRequest): Promise<HttpClientStreamResponse> {
    return new Promise<HttpClientStreamResponse>((resolve, reject) => {
      reject(new Error(`Stream request not supported yet`))
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

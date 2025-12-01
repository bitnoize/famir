import { DIContainer, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  HTTP_CLIENT,
  HttpClient,
  HttpClientError,
  HttpClientErrorCode,
  HttpClientRequest,
  HttpClientResponse,
  HttpHeaders,
  Logger,
  LOGGER
} from '@famir/domain'
import { Curl, CurlCode, CurlFeature } from 'node-libcurl'
import { HttpClientConfig, HttpClientOptions } from './http-client.js'

export class CurlHttpClient implements HttpClient {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpClient>(
      HTTP_CLIENT,
      (c) =>
        new CurlHttpClient(c.resolve<Config<HttpClientConfig>>(CONFIG), c.resolve<Logger>(LOGGER))
    )
  }

  protected readonly options: HttpClientOptions

  constructor(
    config: Config<HttpClientConfig>,
    protected readonly logger: Logger
  ) {
    this.options = this.buildOptions(config.data)
  }

  forwardRequest(request: HttpClientRequest): Promise<HttpClientResponse> {
    return new Promise<HttpClientResponse>((resolve, reject) => {
      const curl = new Curl()

      let shouldStop = 0

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
            if (shouldStop != 0) {
              return 0
            }

            const chunkSize = Math.min(size * nmemb,  request.body.length - requestBodyOffset)

            if (chunkSize <= 0) {
              return 0
            }

            request.body.copy(buf, 0, requestBodyOffset, requestBodyOffset + chunkSize)

            requestBodyOffset += chunkSize

            return chunkSize
          } catch (error) {
            this.logger.error(`HttpClient Curl READFUNCTION error`, {
              error: serializeError(error),
            })

            shouldStop = 1

            return 0
          }
        })
      }

      //curl.setOpt(Curl.option.MAXFILESIZE_LARGE, request.bodyLimit)

      curl.setOpt(Curl.option.HEADER, false)

      const responseHeaders: Buffer[] = []

      curl.setOpt(Curl.option.HEADERFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
        try {
          if (shouldStop != 0) {
            return 0
          }

          const chunkSize = size * nmemb
          const chunk = buf.subarray(0, chunkSize)

          responseHeaders.push(chunk)

          return chunkSize
        } catch (error) {
          this.logger.error(`HttpClient Curl HEADERFUNCTION error`, {
            error: serializeError(error),
          })

          shouldStop = 2

          return 0
        }
      })

      //curl.setOpt(Curl.option.NOBODY, false)

      const responseBody: Buffer[] = []
      let responseBodySize = 0

      curl.setOpt(Curl.option.WRITEFUNCTION, (buf: Buffer, size: number, nmemb: number) => {
        try {
          if (shouldStop != 0) {
            return 0
          }

          const chunkSize = size * nmemb
          const chunk = buf.subarray(0, chunkSize)

          if (responseBodySize + chunkSize > request.bodyLimit) {
            shouldStop = 3

            return 0
          }

          responseBody.push(chunk)

          responseBodySize += chunkSize

          return chunkSize
        } catch (error) {
          this.logger.error(`HttpClient Curl WRITEFUNCTION error`, {
            error: serializeError(error),
          })

          shouldStop = 4

          return 0
        }
      })

      curl.on('end', (status: number) => {
        try {
          const totalTime = curl.getInfo('TOTAL_TIME_T')
          const connectTime = curl.getInfo('CONNECT_TIME_T')
          const httpVersion = curl.getInfo('HTTP_VERSION')

          curl.close()

          if (shouldStop != 0) {
            reject(
              new HttpClientError(`Response body too large`, {
                context: {
                  shouldStop
                },
                code: 'BAD_GATEWAY'
              })
            )

            return
          }

          resolve({
            status,
            headers: this.parseHeaders(responseHeaders),
            body: Buffer.concat(responseBody),
            totalTime: typeof totalTime === 'number' ? totalTime : 0,
            connectTime: typeof connectTime === 'number' ? connectTime : 0,
            httpVersion: typeof httpVersion === 'number' ? httpVersion : 0
          })
        } catch (error) {
          reject(
            new HttpClientError(`Curl end event error`, {
              cause: error,
              context: {
                params: [status]
              },
              code: 'INTERNAL_ERROR'
            })
          )
        }
      })

      curl.on('error', (error: Error, curlCode: CurlCode) => {
        try {
          curl.close()

          const errorCode = this.knownCurlCodes[curlCode]

          reject(
            new HttpClientError(`Forward request failed`, {
              cause: error,
              context: {
                curlCode
              },
              code: errorCode ? errorCode : 'INTERNAL_ERROR'
            })
          )
        } catch (fatalError) {
          reject(
            new HttpClientError(`Curl error event fatal error`, {
              cause: fatalError,
              context: {
                params: [error, curlCode],
              },
              code: 'INTERNAL_ERROR'
            })
          )
        }
      })

      curl.perform()
    })
  }

  protected knownCurlCodes: Record<number, HttpClientErrorCode> = {
    5: 'BAD_GATEWAY', // COULDNT_RESOLVE_PROXY
    6: 'BAD_GATEWAY', // COULDNT_RESOLVE_HOST
    7: 'BAD_GATEWAY', // COULDNT_CONNECT
    28: 'GATEWAY_TIMEOUT', // OPERATION_TIMEDOUT
    35: 'BAD_GATEWAY' //SSL_CONNECT_ERROR
  }

  /*
  forwardStreamingRequest(request: HttpClientRequest): Promise<HttpClientStreamingResponse> {
    return new Promise<HttpClientResponse>((resolve, reject) => {
      const curl = new Curl()

      curl.perform()
    })
  }
  */

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

      if (!(name && value)) {
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

  private buildOptions(config: HttpClientConfig): HttpClientOptions {
    return {
      verbose: config.HTTP_CLIENT_VERBOSE
    }
  }
}

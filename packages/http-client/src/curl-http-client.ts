import { DIContainer, isDevelopment } from '@famir/common'
import {
  Config,
  CONFIG,
  HTTP_CLIENT,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
  Logger,
  LOGGER
} from '@famir/domain'
import { Curl, CurlFeature } from 'node-libcurl'
import setCookie from 'set-cookie-parser'
import { HttpClientConfig, HttpClientOptions } from './http-client.js'
import { buildOptions, parseCookieSameSite } from './http-client.utils.js'

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
    this.options = buildOptions(config.data)

    this.logger.debug(`HttpClient initialized`, {
      options: isDevelopment ? this.options : null
    })
  }

  async query(request: HttpClientRequest): Promise<HttpClientResponse> {
    const requestCookies: string[] = []

    Object.entries(request.cookies).forEach(([name, cookie]) => {
      if (cookie != null) {
        requestCookies.push(`${name}=${cookie}`)
      }
    })

    if (requestCookies.length > 0) {
      request.headers['cookie'] = requestCookies.join('; ')
    }

    const response = await this._query(request)

    const setCookieHeader = response.headers['set-cookie'] || ''

    setCookie.parse(setCookieHeader, { decodeValues: false }).forEach((cookie) => {
      response.cookies[cookie.name] = {
        value: cookie.value,
        maxAge: cookie.maxAge,
        expires: cookie.expires ? cookie.expires.getTime() : undefined,
        httpOnly: cookie.httpOnly,
        path: cookie.path,
        domain: cookie.domain,
        secure: cookie.secure,
        sameSite: parseCookieSameSite(cookie.sameSite)
      }
    })

    return response
  }

  private _query(request: HttpClientRequest): Promise<HttpClientResponse> {
    return new Promise<HttpClientResponse>((resolve) => {
      const startTime = Date.now()

      const response: HttpClientResponse = {
        status: 0,
        headers: {},
        cookies: {},
        queryTime: 0,
        body: Buffer.alloc(0)
      }

      const curl = new Curl()

      try {
        curl.enable(CurlFeature.Raw)

        curl.setOpt(Curl.option.DNS_USE_GLOBAL_CACHE, 1)

        curl.setOpt(Curl.option.MAXFILESIZE_LARGE, this.options.bodyLimit)

        curl.setOpt(Curl.option.PROXY, request.proxy)

        curl.setOpt(Curl.option.CUSTOMREQUEST, request.method)

        curl.setOpt(Curl.option.URL, request.url)

        const headers: string[] = []

        Object.entries(request.headers).forEach(([name, value]) => {
          if (Array.isArray(value)) {
            value.forEach((val) => {
              headers.push(`${name}: ${val}`)
            })
          } else if (value != null) {
            headers.push(`${name}: ${value}`)
          }
        })

        curl.setOpt(Curl.option.HTTPHEADER, headers)

        if (request.body.length > 0) {
          let uploadOffset = 0

          curl.setOpt(Curl.option.INFILESIZE_LARGE, request.body.length)

          curl.setOpt(Curl.option.READFUNCTION, (body: Buffer, size: number, nmemb: number) => {
            const chunkSize = size * nmemb
            const remaining = request.body.length - uploadOffset

            if (remaining <= 0) {
              return 0
            }

            const bytesToCopy = Math.min(chunkSize, remaining)
            const chunk = request.body.subarray(uploadOffset, uploadOffset + bytesToCopy)

            chunk.copy(body)
            uploadOffset += bytesToCopy

            return bytesToCopy
          })

          curl.setOpt(Curl.option.UPLOAD, 1)
        }

        curl.setOpt(Curl.option.CONNECTTIMEOUT_MS, request.connectTimeout)
        curl.setOpt(Curl.option.TIMEOUT_MS, request.timeout)

        curl.on('end', (status: number, body: Buffer, headers: Buffer[]) => {
          response.status = status
          response.body = body

          headers.forEach((header) => {
            const headerStr = header.toString().trim()
            const colonIdx = headerStr.indexOf(':')

            if (colonIdx === -1) {
              return
            }

            const name = headerStr.substring(0, colonIdx).trim().toLowerCase()
            const value = headerStr.substring(colonIdx + 1).trim()

            if (!name || !value) {
              return
            }

            if (response.headers[name] != null) {
              if (Array.isArray(response.headers[name])) {
                response.headers[name].push(value)
              } else {
                response.headers[name] = [response.headers[name], value]
              }
            } else {
              response.headers[name] = value
            }
          })

          curl.close()

          resolve(response)
        })

        curl.on('error', (error) => {
          curl.close()

          response.error = error

          resolve(response)
        })

        curl.perform()
      } catch (error) {
        curl.close()

        response.status = -1
        response.error = error

        resolve(response)
      } finally {
        response.queryTime = Date.now() - startTime
      }
    })
  }
}

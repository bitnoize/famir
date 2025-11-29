import { DIContainer } from '@famir/common'
import {
  HTTP_CLIENT,
  HttpClient,
  HttpClientError,
  HttpClientRequest,
  HttpClientResponse,
  HttpHeaders
} from '@famir/domain'
import { Curl, CurlCode, CurlFeature } from 'node-libcurl'

export class CurlHttpClient implements HttpClient {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpClient>(HTTP_CLIENT, () => new CurlHttpClient())
  }

  forwardRequest(request: HttpClientRequest): Promise<HttpClientResponse> {
    return new Promise<HttpClientResponse>((resolve, reject) => {
      const curl = new Curl()

      curl.enable(CurlFeature.Raw)

      curl.setOpt(Curl.option.DNS_USE_GLOBAL_CACHE, 1)

      curl.setOpt(Curl.option.CONNECTTIMEOUT_MS, request.connectTimeout)
      curl.setOpt(Curl.option.TIMEOUT_MS, request.requestTimeout)

      curl.setOpt(Curl.option.PROXY, request.proxy)

      curl.setOpt(Curl.option.CUSTOMREQUEST, request.method)

      curl.setOpt(Curl.option.URL, request.url)

      curl.setOpt(Curl.option.HTTPHEADER, this.formatHeaders(request.headers))

      curl.setOpt(Curl.option.ACCEPT_ENCODING, '')

      if (request.body.length > 0) {
        curl.setOpt(Curl.option.UPLOAD, true)
        curl.setOpt(Curl.option.INFILESIZE_LARGE, request.body.length)

        let bodyOffset = 0
        curl.setOpt(Curl.option.READFUNCTION, (body: Buffer, size: number, nmemb: number) => {
          const chunkSize = size * nmemb
          const remaining = request.body.length - bodyOffset

          if (remaining <= 0) {
            return 0
          }

          const bytesToCopy = Math.min(chunkSize, remaining)
          const chunk = request.body.subarray(bodyOffset, bodyOffset + bytesToCopy)

          chunk.copy(body)
          bodyOffset += bytesToCopy

          return bytesToCopy
          /*
          const chunkSize = Math.min(size, request.body.length - bodyOffset)

          if (chunkSize > 0) {
            request.body.copy(body, 0, bodyOffset, bodyOffset + chunkSize)

            bodyOffset += chunkSize

            return chunkSize
          }

          return 0
          */
        })
      }

      curl.setOpt(Curl.option.MAXFILESIZE_LARGE, request.bodyLimit)

      curl.setOpt(Curl.option.HEADER, true)
      curl.setOpt(Curl.option.NOBODY, false)

      curl.on('end', (status: number, body: Buffer, headers: Buffer[]) => {
        curl.close()

        resolve({
          status,
          headers: this.parseHeaders(headers),
          body
        })
      })

      curl.on('error', (error: Error, curlCode: CurlCode) => {
        curl.close()

        reject(
          new HttpClientError(`Forward request failed`, {
            cause: error,
            context: {
              curlCode
            },
            code: 'INTERNAL_ERROR'
          })
        )
      })

      curl.perform()
    })
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
}

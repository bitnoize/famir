import { DIContainer } from '@famir/common'
import { HTTP_CLIENT, HttpClient, HttpClientRequest, HttpHeaders, HttpHeader } from '@famir/domain'
import { BuildResponseData } from './build-response.js'

export const BUILD_RESPONSE_USE_CASE = Symbol('BuildResponseUseCase')

export class BuildResponseUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<BuildResponseUseCase>(
      BUILD_RESPONSE_USE_CASE,
      (c) => new BuildResponseUseCase(c.resolve<HttpClient>(HTTP_CLIENT))
    )
  }

  constructor(protected readonly httpClient: HttpClient) {}

  async execute(data: BuildResponseData): Promise<void> {
    const { proxy, target, createMessage } = data

    const requestHeaders: HttpHeaders = Object.fromEntries(
      Object.entries(createMessage.requestHeaders)
        .filter((entry: [string, HttpHeader | null | undefined]): entry is [string, HttpHeader] => {
          const [, value] = entry

          return !!value
        })
    )

    const request: HttpClientRequest = {
      proxy: proxy.url,
      method: createMessage.method,
      url: createMessage.forwardUrl,
      headers: {},
      cookies: {},
      body: createMessage.requestBody,
      connectTimeout: target.connectTimeout,
      timeout: target.timeout
    }

    const response = await this.httpClient.query(request)

    createMessage.status = response.status

    Object.entries(response.headers).forEach(([name, value]) => {
      if (this.obsoleteResponseHeaders.some((regexp) => regexp.test(name))) {
        return
      }

      createMessage.responseHeaders[name] = value
    })

    Object.entries(response.cookies).forEach(([name, cookie]) => {
      createMessage.responseCookies[name] = {
        value: cookie.value ?? undefined,
        maxAge: cookie.maxAge ?? undefined,
        expires: cookie.expires ? cookie.expires.getTime() : undefined,
        httpOnly: cookie.httpOnly ?? undefined,
        path: cookie.path ?? undefined,
        domain: cookie.domain ?? undefined,
        secure: cookie.secure ?? undefined,
        sameSite: cookie.sameSite ?? undefined
      }
    })
  }
}

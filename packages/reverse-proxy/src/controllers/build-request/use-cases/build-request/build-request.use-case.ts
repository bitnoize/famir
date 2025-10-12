import { DIContainer, randomIdent } from '@famir/common'
import {
  CreateMessageModel,
  HttpServerError,
  TARGET_REPOSITORY,
  TargetRepository
} from '@famir/domain'
import { BuildRequestData, BuildRequestResult } from './build-request.js'

export const BUILD_REQUEST_USE_CASE = Symbol('BuildRequestUseCase')

export class BuildRequestUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<BuildRequestUseCase>(
      BUILD_REQUEST_USE_CASE,
      (c) => new BuildRequestUseCase(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(protected readonly targetRepository: TargetRepository) {}

  protected readonly obsoleteRequestHeaders: RegExp[] = [
    /^Host$/i,
    /^Cookie$/i,
    /^Connection$/i,
    /^Keep-Alive$/i,
    ///^Accept-Encoding$/i,
    ///^Transfer-Encoding$/i,
    ///^TE$/i,
    /^Proxy-*/i,
    ///^Upgrade$/i,
    ///^Upgrade-Insecure-Requests$/i,
    ///^Trailer$/i,
    /^Via$/i,
    /^X-Forwarded-/i,
    /^X-Famir-/i
  ]

  async execute(data: BuildRequestData): Promise<BuildRequestResult> {
    const { campaign, proxy, target, session, request } = data

    const targets = await this.targetRepository.listEnabled({
      campaignId: campaign.campaignId
    })

    if (!targets) {
      throw new HttpServerError(`Campaign lost`, {
        code: 'INTERNAL_ERROR',
        status: 500
      })
    }

    const createMessage: CreateMessageModel = {
      campaignId: campaign.campaignId,
      messageId: randomIdent(),
      proxyId: proxy.proxyId,
      targetId: target.targetId,
      sessionId: session.sessionId,
      clientIp: request.ip,
      method: request.method,
      originUrl: request.url,
      forwardUrl: request.url,
      requestHeaders: {},
      requestCookies: {},
      requestBody: request.body,
      status: 0,
      responseHeaders: {},
      responseCookies: {},
      responseBody: Buffer.alloc(0),
      queryTime: 0,
      score: 0
    }

    Object.entries(request.headers)
      .forEach(([name, value]) => {
        if (this.obsoleteRequestHeaders.some((regexp) => regexp.test(name))) {
          return
        }

        createMessage.requestHeaders[name] = value
      })

    Object.entries(request.cookies)
      .forEach(([name, value]) => {
        if (name === campaign.sessionCookieName) {
          return
        }

        createMessage.requestCookies[name] = value
      })

    return {
      targets,
      createMessage
    }
  }
}

import { DIContainer, randomIdent } from '@famir/common'
import { CreateMessageModel } from '@famir/domain'
import {
  PrepareMessageRequestData,
  PrepareMessageRequestResult
} from './prepare-message-request.js'
import { filterRequestCookie, filterRequestHeader } from './prepare-message-request.utils.js'

export const PREPARE_MESSAGE_REQUEST_USE_CASE = Symbol('PrepareMessageRequestUseCase')

export class PrepareMessageRequestUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<PrepareMessageRequestUseCase>(
      PREPARE_MESSAGE_REQUEST_USE_CASE,
      () => new PrepareMessageRequestUseCase()
    )
  }

  execute(data: PrepareMessageRequestData): PrepareMessageRequestResult {
    const { campaign, target, session, request } = data

    const message: CreateMessageModel = {
      campaignId: campaign.campaignId,
      messageId: randomIdent(),
      proxyId: session.proxyId,
      targetId: target.targetId,
      sessionId: session.sessionId,
      clientIp: request.ip,
      method: request.method,
      originUrl: request.url,
      forwardUrl: request.url,
      requestHeaders: {},
      requestCookies: {},
      requestBody: request.body,
      statusCode: 0,
      responseHeaders: {},
      responseCookies: {},
      responseBody: Buffer.alloc(0),
      queryTime: 0,
      score: 0
    }

    Object.entries(request.headers)
      .filter(filterRequestHeader)
      .forEach(([name, value]) => {
        message.requestHeaders[name] = value
      })

    Object.entries(request.cookies)
      .filter(filterRequestCookie)
      .filter(([name]) => name !== campaign.sessionCookieName)
      .forEach(([name, value]) => {
        message.requestCookies[name] = value
      })

    return { message }
  }
}

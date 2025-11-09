import { DIContainer, isDevelopment } from '@famir/common'
import {
  MESSAGE_REPOSITORY,
  MessageRepository,
  ANALYZE_LOG_QUEUE,
  AnalyzeLogQueue
} from '@famir/domain'
import { CompleteData } from './complete.js'

export const COMPLETE_USE_CASE = Symbol('CompleteUseCase')

export class CompleteUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<CompleteUseCase>(
      COMPLETE_USE_CASE,
      (c) => new CompleteUseCase(
        c.resolve<MessageRepository>(MESSAGE_REPOSITORY),
        c.resolve(AnalyzeLogQueue)(ANALYZE_LOG_QUEUE)
      )
    )
  }

  constructor(
    protected readonly messageRepository: MessageRepository,
    protected readonly analyzeLogQueue: AnalyzeLogQueue
  ) {}

  async execute(data: CompleteData): Promise<void> {
    const { request, response, campaign, proxy, target, session } = data

    const { messageId } = await this.messageRepository.create({
      campaignId: campaign.campaignId,
      proxyId: proxy.proxyId,
      targetId: target.targetId,
      sessionId: session.sessionId,
      clientIp: request.ip,
      method: request.method,
      originUrl: request.originUrl,
      forwardUrl: request.forwardUrl,
      requestHeaders: request.headers,
      requestCookies: request.cookies,
      requestBody: request.body,
      status: response.status,
      responseHeaders: response.headers,
      responseCookies: response.cookies,
      responseBody: response.body,
      queryTime: response.queryTime,
      score: response.score,
    })

    if (isDevelopment) {
      response.headers['x-famir-campaign-id'] = campaign.campaignId
      response.headers['x-famir-proxy-id'] = proxy.proxyId
      response.headers['x-famir-target-id'] = target.targetId
      response.headers['x-famir-session-id'] = session.sessionId
      response.headers['x-famir-message-id'] = messageId
    }

    response.isComplete = true

    // Analyze-log
  }
}

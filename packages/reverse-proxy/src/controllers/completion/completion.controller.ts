import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { formatRelativeUrl } from '@famir/http-tools'
import { BaseController } from '../base/index.js'
import { type CompletionService, COMPLETION_SERVICE } from './completion.service.js'

export const COMPLETION_CONTROLLER = Symbol('CompletionController')

export class CompletionController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      COMPLETION_CONTROLLER,
      (c) =>
        new CompletionController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<CompletionService>(COMPLETION_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): CompletionController {
    return container.resolve(COMPLETION_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter,
    protected readonly completionService: CompletionService
  ) {
    super(validator, logger, router)

    this.router.register('completion', this.completion)

    this.logger.debug(`CompletionController initialized`)
  }

  protected completion: HttpServerMiddleware = async (ctx, next) => {
    const campaign = this.getState(ctx, 'campaign')
    const proxy = this.getState(ctx, 'proxy')
    const target = this.getState(ctx, 'target')
    const session = this.getState(ctx, 'session')
    const message = this.getState(ctx, 'message')

    await this.completionService.createMessage({
      campaignId: campaign.campaignId,
      messageId: message.messageId,
      proxyId: proxy.proxyId,
      targetId: target.targetId,
      sessionId: session.sessionId,
      method: message.method,
      url: formatRelativeUrl(message.url),
      isStreaming: false,
      requestHeaders: message.requestHeaders,
      requestBody: message.requestBody,
      responseHeaders: message.responseHeaders,
      responseBody: message.responseBody,
      clientIp: ctx.clientIp.join(' '),
      status: message.status,
      score: 0,
      startTime: ctx.startTime,
      finishTime: ctx.finishTime,
      connection: message.connection
    })

    await next()
  }
}

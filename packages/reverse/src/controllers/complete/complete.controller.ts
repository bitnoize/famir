import { DIContainer } from '@famir/common'
import { HTTP_SERVER_ROUTER, HttpServerRouter } from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { CREATE_MESSAGE_USE_CASE, type CreateMessageUseCase } from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'
import { COMPLETE_CONTROLLER } from './complete.js'

/*
 * Complete controller
 */
export class CompleteController extends BaseController {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton(
      COMPLETE_CONTROLLER,
      (c) =>
        new CompleteController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<CreateMessageUseCase>(CREATE_MESSAGE_USE_CASE)
        )
    )
  }

  /*
   * Resolve dependency
   */
  static resolve(container: DIContainer): CompleteController {
    return container.resolve(COMPLETE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    protected templater: Templater,
    router: HttpServerRouter,
    protected readonly createMessageUseCase: CreateMessageUseCase
  ) {
    super(validator, logger, router)

    this.logger.debug(`CompleteController initialized`)
  }

  /*
   * Use middleware
   */
  use() {
    this.router.addMiddleware('complete', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const proxy = this.getState(ctx, 'proxy')
      const target = this.getState(ctx, 'target')
      const session = this.getState(ctx, 'session')
      const message = this.getState(ctx, 'message')

      message.payload['user-agent'] = ctx.userAgent

      message.payload['request-content-type'] = message.requestHeaders.getContentType()
      message.payload['request-cookies'] = message.requestHeaders.getCookies()

      message.payload['response-cookies'] = message.responseHeaders.getSetCookies()
      message.payload['response-content-type'] = message.responseHeaders.getContentType()

      await this.createMessageUseCase.execute({
        campaignId: campaign.campaignId,
        messageId: message.id,
        proxyId: proxy.proxyId,
        targetId: target.targetId,
        sessionId: session.sessionId,
        type: message.type,
        method: message.method.get(),
        url: message.url.toRelative(),
        requestHeaders: message.requestHeaders.toObject(),
        requestBody: message.requestBody.get(),
        status: message.status.get(),
        responseHeaders: message.responseHeaders.toObject(),
        responseBody: message.responseBody.get(),
        connection: message.connection,
        payload: message.payload,
        errors: message.errors,
        processor: message.processor,
        startTime: ctx.startTime,
        finishTime: ctx.finishTime
      })

      await next()
    })
  }
}

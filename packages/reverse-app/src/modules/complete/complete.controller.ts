import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ASSETS,
  HTTP_SERVER_ROUTER,
  HttpServerAssets,
  HttpServerRouter,
} from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { type CompleteService, COMPLETE_SERVICE } from './complete.service.js'

/**
 * DI token for the complete controller.
 *
 * @category Complete
 */
export const COMPLETE_CONTROLLER = Symbol('CompleteController')

/**
 * Represents the complete controller.
 *
 * @category Complete
 */
export class CompleteController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<CompleteController>(
      COMPLETE_CONTROLLER,
      (c) =>
        new CompleteController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<CompleteService>(COMPLETE_SERVICE)
        )
    )
  }

  /**
   * Resolves the controller from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The controller instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<CompleteController>(COMPLETE_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   * @param completeService - The complete service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    assets: HttpServerAssets,
    router: HttpServerRouter,
    protected readonly completeService: CompleteService
  ) {
    super(validator, logger, templater, assets, router)
  }

  /**
   * Registers used middleware in the router.
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

      if (ctx.state.verbose || message.analyze) {
        await this.completeService.createMessage({
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
          analyze: message.analyze,
          startTime: ctx.startTime,
          finishTime: ctx.finishTime,
        })
      } else {
        await this.completeService.createDummyMessage({
          campaignId: campaign.campaignId,
          messageId: message.id,
          proxyId: proxy.proxyId,
          targetId: target.targetId,
          sessionId: session.sessionId,
        })
      }

      await next()
    })
  }
}

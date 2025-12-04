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
import { BaseController } from '../base/index.js'
import { type CompleteService, COMPLETE_SERVICE } from './complete.service.js'

export const COMPLETE_CONTROLLER = Symbol('CompleteController')

export class CompleteController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<CompleteController>(
      COMPLETE_CONTROLLER,
      (c) =>
        new CompleteController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<CompleteService>(COMPLETE_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): CompleteController {
    return container.resolve<CompleteController>(COMPLETE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter,
    protected readonly completeService: CompleteService
  ) {
    super(validator, logger, router, 'complete')

    this.router.addMiddleware(this.defaultMiddleware)
  }

  private defaultMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      const { campaign, target } = this.getSetupMirrorState(ctx)
      const { session, proxy } = this.getAuthorizeState(ctx)

      const { message } = await this.completeService.createMessage({
        campaignId: campaign.campaignId,
        proxyId: proxy.proxyId,
        targetId: target.targetId,
        sessionId: session.sessionId,
        logs: ctx.logs,
        method: ctx.method,
        url: ctx.normalizeUrl(),
        isStreaming: ctx.isStreaming,
        requestHeaders: ctx.requestHeaders,
        requestCookies: ctx.requestCookies,
        requestBody: ctx.requestBody,
        responseHeaders: ctx.responseHeaders,
        responseCookies: ctx.responseCookies,
        responseBody: ctx.responseBody,
        clientIp: '',
        status: ctx.status,
        score: ctx.score,
        startTime: ctx.startTime,
        finishTime: ctx.finishTime,
        connection: ctx.connection
      })

      //this.setComplete(ctx, message)

      await next()
    } catch (error) {
      this.handleException(error, 'default')
    }
  }
}

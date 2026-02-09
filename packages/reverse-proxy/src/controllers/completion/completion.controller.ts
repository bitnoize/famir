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

    this.logger.debug(`CompletionController initialized`)
  }

  register(): this {
    this.router.register('completion', this.completionMiddleware)

    return this
  }

  private completionMiddleware: HttpServerMiddleware = async (ctx, next) => {
    const campaign = this.getState(ctx, 'campaign')
    const proxy = this.getState(ctx, 'proxy')
    const target = this.getState(ctx, 'target')
    const session = this.getState(ctx, 'session')
    const forward = this.getState(ctx, 'forward')

    const message = forward.message

    await this.completionService.createMessage({
      campaignId: campaign.campaignId,
      messageId: forward.message.id,
      proxyId: proxy.proxyId,
      targetId: target.targetId,
      sessionId: session.sessionId,
      kind: forward.kind,
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
      score: message.score,
      ip: ctx.ip,
      startTime: ctx.startTime,
      finishTime: ctx.finishTime
    })

    await next()
  }
}

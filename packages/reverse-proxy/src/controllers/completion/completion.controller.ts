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
    container.registerSingleton<CompletionController>(
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
    return container.resolve<CompletionController>(COMPLETION_CONTROLLER)
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
    const target = this.getState(ctx, 'target')
    const proxy = this.getState(ctx, 'proxy')
    const session = this.getState(ctx, 'session')

    const messageId = await this.completionService.createMessage({
      campaignId: campaign.campaignId,
      proxyId: proxy.proxyId,
      targetId: target.targetId,
      sessionId: session.sessionId,
      method: '',
      url: '',
      isStreaming: false,
      requestHeaders: {},
      requestBody: Buffer.alloc(0),
      responseHeaders: {},
      responseBody: Buffer.alloc(0),
      clientIp: '',
      status: 0,
      score: 0,
      startTime: ctx.startTime,
      finishTime: ctx.finishTime,
      connection: {}
    })

    //this.setState(ctx, 'message', message)

    await next()
  }
}

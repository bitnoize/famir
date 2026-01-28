import { DIContainer, isDevelopment, randomIdent } from '@famir/common'
import {
  TargetModel,
  HttpServerContext,
  FullCampaignModel,
  HTTP_SERVER_ROUTER,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR,
  HttpUrlWrapper,
  HttpHeadersWrapper,
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { StdHttpMessage } from '@famir/http-tools'

export const DISTRIBUTE_CONTROLLER = Symbol('DistributeController')

export class DistributeController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      DISTRIBUTE_CONTROLLER,
      (c) =>
        new DistributeController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  static resolve(container: DIContainer): DistributeController {
    return container.resolve(DISTRIBUTE_CONTROLLER)
  }

  constructor(validator: Validator, logger: Logger, router: HttpServerRouter) {
    super(validator, logger, router)

    this.router.register('distribute', this.distribute)

    this.logger.debug(`DistributeController initialized`)
  }

  protected distribute: HttpServerMiddleware = async (ctx, next) => {
    const campaign = this.getState(ctx, 'campaign')
    const target = this.getState(ctx, 'target')

    await ctx.loadRequest(target.requestBodyLimit)

    const message = new StdHttpMessage(
      ctx.method,
      ctx.url.clone(),
      ctx.requestHeaders.clone(),
      ctx.requestBody,
      ctx.responseHeaders.clone().reset(),
      ctx.responseBody,
      ctx.status
    )

    message.initRequest(campaign, target)

    this.setState(ctx, 'message', message)

    if (isDevelopment) {
      ctx.responseHeaders.set('X-Famir-Message-Id', message.messageId)
    }

    await next()
  }
}

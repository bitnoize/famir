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

export const BUILD_REQUEST_CONTROLLER = Symbol('BuildRequestController')

export class BuildRequestController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<BuildRequestController>(
      BUILD_REQUEST_CONTROLLER,
      (c) =>
        new BuildRequestController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  static resolve(container: DIContainer): BuildRequestController {
    return container.resolve<BuildRequestController>(BUILD_REQUEST_CONTROLLER)
  }

  constructor(validator: Validator, logger: Logger, router: HttpServerRouter) {
    super(validator, logger, router)

    this.router.register('buildRequest', this.buildRequest)

    this.logger.debug(`BuildRequestController initialized`)
  }

  protected buildRequest: HttpServerMiddleware = async (ctx, next) => {
    const target = this.getState(ctx, 'target')

    await ctx.loadRequestBody(target.requestBodyLimit)

    await next()
  }
}

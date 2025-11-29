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
      this.testConfigure(ctx.state)
      this.testAuthorize(ctx.state)

      const { campaign, proxy, target, session } = ctx.state

      await next()
    } catch (error) {
      this.handleException(error, 'default')
    }
  }
}

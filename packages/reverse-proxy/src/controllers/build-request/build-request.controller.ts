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
    super(validator, logger, router, 'build-request')

    this.router.addMiddleware(this.defaultMiddleware)
  }

  private defaultMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      const { target } = this.getSetupMirrorState(ctx)

      ctx.prepareRequestHeaders()

      ctx.setRequestHeaders({
        Host: undefined,
        Connection: undefined,
        'Keep-Alive': undefined,
        Upgrade: undefined,
        Cookie: undefined,
        'X-Famir-Campaign-Id': undefined,
        'X-Famir-Target-Id': undefined,
        'X-Famir-Client-Ip': undefined
      })

      await ctx.loadRequestBody(target.requestBodyLimit)

      await next()
    } catch (error) {
      this.handleException(error, 'default')
    }
  }
}

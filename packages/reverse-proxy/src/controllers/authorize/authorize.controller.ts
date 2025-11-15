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
//import {
//  type AuthLandingUseCase,
//  AUTH_LANDING_USE_CASE,
//  type AuthTransparentUseCase,
//  AUTH_TRANSPARENT_USE_CASE,
//} from './use-cases/index.js'

export const AUTHORIZE_CONTROLLER = Symbol('AuthorizeController')

export class AuthorizeController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<AuthorizeController>(
      AUTHORIZE_CONTROLLER,
      (c) =>
        new AuthorizeController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
          //c.resolve<AuthLandingUseCase>(AUTH_LANDING_USE_CASE),
          //c.resolve<AuthTransparentUseCase>(AUTH_TRANSPARENT_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): AuthorizeController {
    return container.resolve<AuthorizeController>(AUTHORIZE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter
    //protected readonly authLandingUseCase: AuthLandingUseCase,
    //protected readonly authTransparentUseCase: AuthTransparentUseCase,
  ) {
    super(validator, logger, router, 'authorize')

    this.router.addMiddleware('authorize', this.authLandingMiddleware)
    this.router.addMiddleware('authorize', this.authTransparentMiddleware)

    this.logger.debug(`Controller initialized`, {
      controllerName: this.controllerName
    })
  }

  private authLandingMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.existsStateCampaign(ctx.state)
      this.existsStateTarget(ctx.state)

      const { campaign, target } = ctx.state

      if (!target.isLanding) {
        await next()

        return
      }

      await next()
    } catch (error) {
      this.handleException(error, 'authLanding')
    }
  }

  private authTransparentMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.existsStateCampaign(ctx.state)
      this.existsStateTarget(ctx.state)

      const { campaign, target } = ctx.state

      if (target.isLanding) {
        await next()

        return
      }

      await next()
    } catch (error) {
      this.handleException(error, 'authTransparent')
    }
  }
}

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

    this.router.addMiddleware('authorize', this.landingAuthMiddleware)

    this.logger.debug(`Controller initialized`, {
      controllerName: this.controllerName
    })
  }

  private landingAuthMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.existsStateCampaign(ctx.state)
      this.existsStateTarget(ctx.state)

      const { campaign, target } = ctx.state

      const isFound = target.isLanding && ctx.isUrlPath(campaign.landingAuthPath)

      if (!isFound) {
        await next()

        return
      }

      /*
      const authQuery = ctx.parseUrlQuery()

      const value = authQuery['campaign.landingAuthParam']

      this.parseAuthQuery(authQuery[campaign.landingAuthParam])

      if (!authQuery) {
        this.renderNotFound()

        return
      }

      const { session, proxy } = this.landingAuthUseCase.execute({
        campaignId: campaign.campaignId,
        lureId: authQuery.lureId,
        sessionId: authQuery.sessionId,
        sessionSecret: authQuery.sessionSecret
      })

      if (!session) {
        this.renderFailureRedirect()
      }

      ctx.responseCookies[campaign.sessionCookieName]
      */
    } catch (error) {
      this.handleException(error, 'landingAuth')
    }
  }
}

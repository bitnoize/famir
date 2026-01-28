import {
  EnabledFullTargetModel,
  HttpServerContext,
  HttpServerRouter,
  Logger,
  Validator
} from '@famir/domain'
import { ReverseProxyState } from './base.js'

export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly router: HttpServerRouter
  ) {}

  protected getState<T extends ReverseProxyState, K extends keyof T>(
    ctx: HttpServerContext,
    key: K
  ): NonNullable<T[K]> {
    const state = ctx.state as T

    if (state[key] == null) {
      throw new Error(`State '${String(key)}' missing`)
    }

    return state[key]
  }

  protected setState<T extends ReverseProxyState, K extends keyof T>(
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

  protected async renderOriginRedirect(ctx: HttpServerContext): Promise<void> {
    ctx.responseHeaders.set('Location', ctx.url.toString(true))

    ctx.status.set(302)

    await ctx.sendResponse()
  }

  protected async renderMainRedirect(ctx: HttpServerContext): Promise<void> {
    ctx.responseHeaders.set('Location', '/')

    ctx.status.set(302)

    await ctx.sendResponse()
  }

  protected async renderMainPage(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (ctx.method.is(['GET', 'HEAD'])) {
      const body = Buffer.from(target.mainPage)

      ctx.responseHeaders.merge({
        'Content-Type': 'text/html',
        'Content-Length': body.length.toString(),
        'Last-Modified': target.updatedAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400',
      })

      ctx.status.set(200)

      if (ctx.method.is('GET')) {
        ctx.responseBody.set(body)
      }

      await ctx.sendResponse()
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }

  protected async renderNotFoundPage(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    const body = Buffer.from(target.notFoundPage)

    ctx.responseHeaders.merge({
      'Content-Type': 'text/html',
      'Content-Length': body.length.toString(),
    })

    ctx.responseBody.set(body)

    ctx.status.set(404)

    await ctx.sendResponse()
  }
}

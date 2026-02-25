import { EnabledFullTargetModel } from '@famir/database'
import { HttpServerContext, HttpServerRouter } from '@famir/http-server'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { ReverseState } from '../../reverse.js'

export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly router: HttpServerRouter
  ) {}

  protected getState<T extends ReverseState, K extends keyof T>(
    ctx: HttpServerContext,
    key: K
  ): NonNullable<T[K]> {
    const state = ctx.state as T

    if (state[key] == null) {
      throw new Error(`State '${String(key)}' missing`)
    }

    return state[key]
  }

  protected setState<T extends ReverseState, K extends keyof T>(
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
    ctx.status.set(302)

    ctx.responseHeaders.set('Location', ctx.url.toRelative())

    await ctx.sendResponse()
  }

  protected async renderMainRedirect(ctx: HttpServerContext): Promise<void> {
    ctx.status.set(302)

    ctx.responseHeaders.set('Location', '/')

    await ctx.sendResponse()
  }

  protected async renderMainPage(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (ctx.method.is(['GET', 'HEAD'])) {
      ctx.status.set(200)

      ctx.responseBody.setText(target.mainPage)

      ctx.responseHeaders.merge({
        'Content-Type': 'text/html',
        'Content-Length': ctx.responseBody.length.toString(),
        'Last-Modified': target.updatedAt.toUTCString(),
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

  protected async renderNotFoundPage(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    ctx.status.set(404)

    ctx.responseBody.setText(target.notFoundPage)

    ctx.responseHeaders.merge({
      'Content-Type': 'text/html',
      'Content-Length': ctx.responseBody.length.toString()
    })

    await ctx.sendResponse()
  }
}

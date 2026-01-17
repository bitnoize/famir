import {
  EnabledFullTargetModel,
  HttpServerContext,
  HttpServerRouter,
  Logger,
  Validator
} from '@famir/domain'
import { setHeader, setHeaders } from '@famir/http-tools'
import { ReverseProxyState } from '../../reverse-proxy.js'

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
    setHeader(ctx.responseHeaders, 'Location', ctx.originUrl)

    await ctx.sendResponseBody(302)
  }

  protected async renderMainRedirect(ctx: HttpServerContext): Promise<void> {
    setHeader(ctx.responseHeaders, 'Location', '/')

    await ctx.sendResponseBody(302)
  }

  protected async renderMainPage(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (['GET', 'HEAD'].includes(ctx.method)) {
      const body = Buffer.from(target.mainPage)

      setHeaders(ctx.responseHeaders, {
        'Content-Type': 'text/html',
        'Content-Length': body.length.toString(),
        'Last-Modified': target.updatedAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400'
      })

      if (ctx.method === 'GET') {
        await ctx.sendResponseBody(200, body)
      } else {
        await ctx.sendResponseBody(200)
      }
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }

  protected async renderNotFoundPage(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    const body = Buffer.from(target.notFoundPage)

    setHeaders(ctx.responseHeaders, {
      'Content-Type': 'text/html',
      'Content-Length': body.length.toString()
    })

    await ctx.sendResponseBody(404, body)
  }
}

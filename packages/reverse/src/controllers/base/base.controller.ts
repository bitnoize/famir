import {
  CampaignShare,
  EnabledFullTargetModel,
  EnabledProxyModel,
  FullCampaignModel,
  SessionModel,
  TargetModel
} from '@famir/database'
import { HttpServerContext, HttpServerContextState, HttpServerRouter } from '@famir/http-server'
import { type HttpMessage } from '@famir/http-tools'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'

export interface ReverseState extends HttpServerContextState {
  campaignShare?: CampaignShare
  campaign?: FullCampaignModel
  proxy?: EnabledProxyModel
  target?: EnabledFullTargetModel
  targets?: TargetModel[]
  session?: SessionModel
  message?: HttpMessage
}

/*
 * Base controller
 */
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

  protected async sendNoContent(ctx: HttpServerContext, status = 200): Promise<void> {
    if (ctx.type !== 'normal') {
      throw new Error(`Only 'normal' context type allowed`)
    }

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
      'Access-Control-Max-Age': '86400'
    })

    await ctx.sendResponse()
  }

  protected async sendRedirectTo(ctx: HttpServerContext, url: string, status = 302): Promise<void> {
    if (ctx.type !== 'normal') {
      throw new Error(`Only 'normal' context type allowed`)
    }

    ctx.status.set(status)

    ctx.responseHeaders.merge({
      Location: url,
      'Referrer-Policy': 'no-referrer'
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
    if (ctx.type !== 'normal') {
      throw new Error(`Only 'normal' context type allowed`)
    }

    if (ctx.method.is(['GET', 'HEAD']) && target.mainPage) {
      ctx.status.set(200)

      ctx.responseBody.setText(target.mainPage)

      ctx.responseHeaders.merge({
        'Content-Type': 'text/html',
        'Content-Length': ctx.responseBody.length.toString(),
        'Last-Modified': target.createdAt.toUTCString(),
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

  protected async sendNotFoundPage(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (ctx.type !== 'normal') {
      throw new Error(`Only 'normal' context type allowed`)
    }

    ctx.status.set(404)

    if (target.notFoundPage) {
      ctx.responseBody.setText(target.notFoundPage)

      ctx.responseHeaders.merge({
        'Content-Type': 'text/html',
        'Content-Length': ctx.responseBody.length.toString()
      })
    } else {
      ctx.responseBody.setText(`Not found`)

      ctx.responseHeaders.merge({
        'Content-Type': 'text/plain',
        'Content-Length': ctx.responseBody.length.toString()
      })
    }

    await ctx.sendResponse()
  }
}

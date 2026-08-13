import { DIContainer } from '@famir/common'
import { EnabledFullTargetModel, EnabledProxyModel } from '@famir/database'
import { HttpType } from '@famir/http-proto'
import {
  HTTP_SERVER_ASSETS,
  HTTP_SERVER_ROUTER,
  HttpServerAssets,
  HttpServerContext,
  HttpServerNextFunction,
  HttpServerRouter,
} from '@famir/http-server'
import { LimiterTransform, type HttpMessage } from '@famir/http-tools'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { PassThrough, pipeline as pipelineSync } from 'node:stream'
import { pipeline as pipelineAsync } from 'node:stream/promises'
import { BaseController } from '../base/index.js'
import { FORWARD_SERVICE, type ForwardService } from './forward.service.js'

/**
 * @category Forward
 * @internal
 */
type ForwardHandler = (
  ctx: HttpServerContext,
  proxy: EnabledProxyModel,
  target: EnabledFullTargetModel,
  message: HttpMessage,
  next: HttpServerNextFunction
) => Promise<void>

/**
 * @category Forward
 * @internal
 */
type ForwardDispatchHttpType = Record<HttpType, ForwardHandler>

/**
 * DI token for the forward controller.
 *
 * @category Forward
 */
export const FORWARD_CONTROLLER = Symbol('ForwardController')

/**
 * Represents the forward controller.
 *
 * @category Forward
 */
export class ForwardController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ForwardController>(
      FORWARD_CONTROLLER,
      (c) =>
        new ForwardController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<ForwardService>(FORWARD_SERVICE)
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
    return container.resolve<ForwardController>(FORWARD_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   * @param forwardService - The forward service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    assets: HttpServerAssets,
    router: HttpServerRouter,
    protected readonly forwardService: ForwardService
  ) {
    super(validator, logger, templater, assets, router)
  }

  /**
   * Registers used middleware in the router.
   */
  use() {
    this.router.addMiddleware('round-trip', async (ctx, next) => {
      const proxy = this.getState(ctx, 'proxy')
      const target = this.getState(ctx, 'target')
      const message = this.getState(ctx, 'message')

      message.ready()

      await this.dispatchRoot[message.type](ctx, proxy, target, message, next)
    })
  }

  private dispatchRoot: ForwardDispatchHttpType = {
    'normal-simple': async (ctx, proxy, target, message, next) => {
      await ctx.loadRequest(target.bodySizeLimit)

      message.method.set(ctx.method.get())
      message.url.merge(ctx.url.toObject())
      message.requestHeaders.merge(ctx.requestHeaders.toObject())
      message.requestBody.set(ctx.requestBody.get())
      message.mergeConnection(ctx.connection)

      message.runRequestHeadInterceptors()
      message.runRequestBodyInterceptors()

      const result = await this.forwardService.simple({
        proxy: proxy.url,
        method: message.method.get(),
        url: message.url.toAbsolute(),
        requestHeaders: message.requestHeaders.toObject(),
        requestBody: message.requestBody.get(),
        connectTimeout: target.connectTimeout,
        timeout: target.simpleTimeout,
        headersSizeLimit: target.headersSizeLimit,
        bodySizeLimit: target.bodySizeLimit,
      })

      message.status.set(result.status)
      message.responseHeaders.merge(result.responseHeaders)
      message.responseBody.set(result.responseBody)
      message.mergeConnection(result.connection)

      if (result.error) {
        message.addError(result.error, ['forward', 'normal-simple'])

        await this.sendErrorPage(ctx, result.error, true)
      } else {
        message.runResponseHeadInterceptors()
        message.runResponseBodyInterceptors()

        ctx.status.set(message.status.get())
        ctx.responseHeaders.merge(message.responseHeaders.toObject())
        ctx.responseBody.set(message.responseBody.get())

        await ctx.sendResponse()
      }

      await next()
    },

    'normal-stream-request': async (ctx, proxy, target, message, next) => {
      message.method.set(ctx.method.get())
      message.url.merge(ctx.url.toObject())
      message.requestHeaders.merge(ctx.requestHeaders.toObject())
      message.mergeConnection(ctx.connection)

      message.runRequestHeadInterceptors()

      const requestStream = new PassThrough()
      const limiterTransform = new LimiterTransform(target.bodySizeLimit)

      pipelineSync(
        ctx.requestStream,
        limiterTransform,
        ...message.getRequestTransforms(),
        requestStream,
        (error) => {
          if (error) {
            message.addError(error, ['forward', 'normal-stream-request', 'pipeline'])

            this.logger.warn(`HttpServer request stream pipeline error`, { error })

            ctx.close()
          }
        }
      )

      const result = await this.forwardService.streamRequest({
        proxy: proxy.url,
        method: message.method.get(),
        url: message.url.toAbsolute(),
        requestHeaders: message.requestHeaders.toObject(),
        requestStream,
        connectTimeout: target.connectTimeout,
        timeout: target.streamTimeout,
        headersSizeLimit: target.headersSizeLimit,
        bodySizeLimit: target.bodySizeLimit,
      })

      message.status.set(result.status)
      message.responseHeaders.merge(result.responseHeaders)
      message.responseBody.set(result.responseBody)
      message.mergeConnection(result.connection)

      if (result.error) {
        message.addError(result.error, ['forward', 'normal-stream-request'])

        await this.sendErrorPage(ctx, result.error, false)
      } else {
        message.runResponseHeadInterceptors()
        message.runResponseBodyInterceptors()

        ctx.status.set(message.status.get())
        ctx.responseHeaders.merge(message.responseHeaders.toObject())
        ctx.responseBody.set(message.responseBody.get())

        await ctx.sendResponse()
      }

      await next()
    },

    'normal-stream-response': async (ctx, proxy, target, message, next) => {
      await ctx.loadRequest(target.bodySizeLimit)

      message.method.set(ctx.method.get())
      message.url.merge(ctx.url.toObject())
      message.requestHeaders.merge(ctx.requestHeaders.toObject())
      message.requestBody.set(ctx.requestBody.get())
      message.mergeConnection(ctx.connection)

      message.runRequestHeadInterceptors()
      message.runRequestBodyInterceptors()

      const result = await this.forwardService.streamResponse({
        proxy: proxy.url,
        method: message.method.get(),
        url: message.url.toAbsolute(),
        requestHeaders: message.requestHeaders.toObject(),
        requestBody: message.requestBody.get(),
        connectTimeout: target.connectTimeout,
        timeout: target.streamTimeout,
        headersSizeLimit: target.headersSizeLimit,
      })

      message.status.set(result.status)
      message.responseHeaders.merge(result.responseHeaders)
      message.mergeConnection(result.connection)

      if (result.error) {
        message.addError(result.error, ['forward', 'normal-stream-response'])

        await this.sendErrorPage(ctx, result.error, false)
      } else {
        message.runResponseHeadInterceptors()

        ctx.status.set(message.status.get())
        ctx.responseHeaders.merge(message.responseHeaders.toObject())

        ctx.sendHead()

        try {
          const limiterTransform = new LimiterTransform(target.bodySizeLimit)

          await pipelineAsync(
            result.responseStream,
            limiterTransform,
            ...message.getResponseTransforms(),
            ctx.responseStream
          )
        } catch (error) {
          message.addError(error, ['forward', 'normal-stream-response', 'pipeline'])

          this.logger.warn(`HttpServer response stream pipeline error`, { error })

          ctx.close()
        }
      }

      await next()
    },

    'websocket': async (ctx, proxy, target, message, next) => {
      await ctx.loadRequest(target.bodySizeLimit)

      message.method.set(ctx.method.get())
      message.url.merge(ctx.url.toObject())
      message.requestHeaders.merge(ctx.requestHeaders.toObject())
      message.requestBody.set(ctx.requestBody.get())
      message.mergeConnection(ctx.connection)

      message.runRequestHeadInterceptors()
      message.runRequestBodyInterceptors()

      ctx.close()

      await next()
    },
  }
}

import { DIContainer } from '@famir/common'
import { HTTP_SERVER_ROUTER, HttpServerRouter } from '@famir/http-server'
import { LimiterTransform } from '@famir/http-tools'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { PassThrough, pipeline as pipelineSync } from 'node:stream'
import { pipeline as pipelineAsync } from 'node:stream/promises'
import { BaseController } from '../base/index.js'
import { FORWARD_CONTROLLER, FORWARD_SERVICE, ForwardDispatchHttpType } from './forward.js'
import { type ForwardService } from './forward.service.js'

/**
 * Represents a forward controller
 *
 * @category Forward
 */
export class ForwardController extends BaseController {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<ForwardController>(
      FORWARD_CONTROLLER,
      (c) =>
        new ForwardController(
          c.resolve(VALIDATOR),
          c.resolve(LOGGER),
          c.resolve(TEMPLATER),
          c.resolve(HTTP_SERVER_ROUTER),
          c.resolve(FORWARD_SERVICE)
        )
    )
  }

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): ForwardController {
    return container.resolve(FORWARD_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter,
    protected readonly forwardService: ForwardService
  ) {
    super(validator, logger, templater, router)

    this.logger.debug(`ForwardController initialized`)
  }

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

      if (result.error) {
        message.addError(result.error, 'forward', 'normal-simple')
        message.mergeConnection(result.connection)

        await this.sendErrorPage(ctx, result.error, true)
      } else {
        message.status.set(result.status)
        message.responseHeaders.merge(result.responseHeaders)
        message.responseBody.set(result.responseBody)
        message.mergeConnection(result.connection)

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
            message.addError(error, 'forward', 'normal-stream-request', 'pipeline')

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

      if (result.error) {
        message.addError(result.error, 'forward', 'normal-stream-request')
        message.mergeConnection(result.connection)

        await this.sendErrorPage(ctx, result.error, false)
      } else {
        message.status.set(result.status)
        message.responseHeaders.merge(result.responseHeaders)
        message.responseBody.set(result.responseBody)
        message.mergeConnection(result.connection)

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

      if (result.error) {
        message.addError(result.error, 'forward', 'normal-stream-response')
        message.mergeConnection(result.connection)

        await this.sendErrorPage(ctx, result.error, false)
      } else {
        message.status.set(result.status)
        message.responseHeaders.merge(result.responseHeaders)
        message.mergeConnection(result.connection)

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
          message.addError(error, 'forward', 'normal-stream-response', 'pipeline')

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

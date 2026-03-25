import { DIContainer } from '@famir/common'
import { EnabledFullTargetModel, EnabledProxyModel } from '@famir/database'
import { HttpClientError } from '@famir/http-client'
import {
  HTTP_SERVER_ROUTER,
  HttpServerContext,
  HttpServerError,
  HttpServerRouter
} from '@famir/http-server'
import { LimiterTransform } from '@famir/http-tools'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { PassThrough, pipeline as pipelineSync } from 'node:stream'
import { pipeline as pipelineAsync } from 'node:stream/promises'
import { type ReverseMessage } from '../../reverse-message.js'
import {
  FORWARD_SIMPLE_USE_CASE,
  FORWARD_STREAM_REQUEST_USE_CASE,
  FORWARD_STREAM_RESPONSE_USE_CASE,
  type ForwardSimpleUseCase,
  type ForwardStreamRequestUseCase,
  type ForwardStreamResponseUseCase
} from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'
import { ROUND_TRIP_CONTROLLER } from './round-trip.js'

export class RoundTripController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      ROUND_TRIP_CONTROLLER,
      (c) =>
        new RoundTripController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<ForwardSimpleUseCase>(FORWARD_SIMPLE_USE_CASE),
          c.resolve<ForwardStreamRequestUseCase>(FORWARD_STREAM_REQUEST_USE_CASE),
          c.resolve<ForwardStreamResponseUseCase>(FORWARD_STREAM_RESPONSE_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): RoundTripController {
    return container.resolve(ROUND_TRIP_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    protected templater: Templater,
    router: HttpServerRouter,
    protected readonly forwardSimpleUseCase: ForwardSimpleUseCase,
    protected readonly forwardStreamRequestUseCase: ForwardStreamRequestUseCase,
    protected readonly forwardStreamResponseUseCase: ForwardStreamResponseUseCase
  ) {
    super(validator, logger, router)

    this.logger.debug(`RoundTripController initialized`)
  }

  use() {
    this.router.addMiddleware('round-trip', async (ctx, next) => {
      const proxy = this.getState(ctx, 'proxy')
      const target = this.getState(ctx, 'target')
      const message = this.getState(ctx, 'message')

      message.ready()

      if (message.isKind('simple')) {
        await this.forwardSimple(ctx, proxy, target, message)
      } else if (message.isKind('stream-request')) {
        await this.forwardStreamRequest(ctx, proxy, target, message)
      } else if (message.isKind('stream-response')) {
        await this.forwardStreamResponse(ctx, proxy, target, message)
      } else {
        throw new HttpServerError(`Server internal error`, {
          context: {
            reason: `Message kind not implemented`,
            messageKind: message.getKind()
          },
          code: 'INTERNAL_ERROR'
        })
      }

      await next()
    })
  }

  protected async forwardSimple(
    ctx: HttpServerContext,
    proxy: EnabledProxyModel,
    target: EnabledFullTargetModel,
    message: ReverseMessage
  ): Promise<void> {
    await ctx.loadRequest(target.bodySizeLimit)

    message.url.merge(ctx.url.toObject())
    message.requestHeaders.merge(ctx.requestHeaders.toObject())
    message.mergeConnection(ctx.connection)

    message.runRequestHeadInterceptors()

    message.requestBody.set(ctx.requestBody.get())

    message.runRequestBodyInterceptors()

    const result = await this.forwardSimpleUseCase.execute({
      proxy: proxy.url,
      method: message.method.get(),
      url: message.url.toAbsolute(),
      requestHeaders: message.requestHeaders.toObject(),
      requestBody: message.requestBody.get(),
      connectTimeout: target.connectTimeout,
      timeout: target.simpleTimeout,
      headersSizeLimit: target.headersSizeLimit,
      bodySizeLimit: target.bodySizeLimit
    })

    if (result.error) {
      message.addError(result.error, 'forward', 'simple')
      message.mergeConnection(result.connection)

      this.renderMessageError(ctx, result.error, true)

      await ctx.sendResponse()
    } else {
      message.status.set(result.status)
      message.responseHeaders.merge(result.responseHeaders)
      message.mergeConnection(result.connection)

      message.runResponseHeadInterceptors()

      message.responseBody.set(result.responseBody)

      message.runResponseBodyInterceptors()

      ctx.status.set(message.status.get())
      ctx.responseHeaders.merge(message.responseHeaders.toObject())
      ctx.responseBody.set(message.responseBody.get())

      await ctx.sendResponse()
    }
  }

  protected async forwardStreamRequest(
    ctx: HttpServerContext,
    proxy: EnabledProxyModel,
    target: EnabledFullTargetModel,
    message: ReverseMessage
  ): Promise<void> {
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
          message.addError(error, 'forward', 'stream-request', 'pipeline')

          this.logger.warn(`HttpServer request stream pipeline error`, { error })
        }
      }
    )

    const result = await this.forwardStreamRequestUseCase.execute({
      proxy: proxy.url,
      method: message.method.get(),
      url: message.url.toAbsolute(),
      requestHeaders: message.requestHeaders.toObject(),
      requestStream,
      connectTimeout: target.connectTimeout,
      timeout: target.streamTimeout,
      headersSizeLimit: target.headersSizeLimit,
      bodySizeLimit: target.bodySizeLimit
    })

    if (result.error) {
      message.addError(result.error, 'forward', 'stream-request')
      message.mergeConnection(result.connection)

      this.renderMessageError(ctx, result.error, false)

      await ctx.sendResponse()
    } else {
      message.status.set(result.status)
      message.responseHeaders.merge(result.responseHeaders)
      message.mergeConnection(result.connection)

      message.runResponseHeadInterceptors()

      message.responseBody.set(result.responseBody)

      message.runResponseBodyInterceptors()

      ctx.status.set(message.status.get())
      ctx.responseHeaders.merge(message.responseHeaders.toObject())
      ctx.responseBody.set(message.responseBody.get())

      await ctx.sendResponse()
    }
  }

  protected async forwardStreamResponse(
    ctx: HttpServerContext,
    proxy: EnabledProxyModel,
    target: EnabledFullTargetModel,
    message: ReverseMessage
  ): Promise<void> {
    await ctx.loadRequest(target.bodySizeLimit)

    message.url.merge(ctx.url.toObject())
    message.requestHeaders.merge(ctx.requestHeaders.toObject())
    message.mergeConnection(ctx.connection)

    message.runRequestHeadInterceptors()

    message.requestBody.set(ctx.requestBody.get())

    message.runRequestBodyInterceptors()

    const result = await this.forwardStreamResponseUseCase.execute({
      proxy: proxy.url,
      method: message.method.get(),
      url: message.url.toAbsolute(),
      requestHeaders: message.requestHeaders.toObject(),
      requestBody: message.requestBody.get(),
      connectTimeout: target.connectTimeout,
      timeout: target.streamTimeout,
      headersSizeLimit: target.headersSizeLimit
    })

    if (result.error) {
      message.addError(result.error, 'forward', 'stream-response')
      message.mergeConnection(result.connection)

      this.renderMessageError(ctx, result.error, false)

      await ctx.sendResponse()
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
        message.addError(error, 'forward', 'stream-response', 'pipeline')

        this.logger.warn(`HttpServer response stream pipeline error`, { error })

        if (!ctx.responseStream.writableEnded) {
          ctx.responseStream.end()
        }
      }
    }
  }

  protected renderMessageError(ctx: HttpServerContext, error: HttpClientError, isHtml: boolean) {
    ctx.status.set(error.status)

    if (isHtml) {
      const errorPage = this.templater.render(ctx.errorPage, {
        status: error.status,
        message: error.message
      })

      ctx.responseHeaders.set('Content-Type', 'text/html')
      ctx.responseBody.setText(errorPage)
    } else {
      ctx.responseHeaders.set('Content-Type', 'text/plain')
      ctx.responseBody.setText(error.message)
    }

    ctx.responseHeaders.set('Content-Length', ctx.responseBody.length.toString())
  }
}

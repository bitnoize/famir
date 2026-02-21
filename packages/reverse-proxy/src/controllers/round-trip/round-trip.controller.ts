import { DIContainer, isDevelopment } from '@famir/common'
import {
  HttpClientBaseResult,
  HttpClientErrorResult,
  HttpClientSimpleResult,
  HttpClientStreamResult
} from '@famir/http-client'
import {
  HTTP_SERVER_ERROR_PAGE,
  HTTP_SERVER_ROUTER,
  HttpServerContext,
  HttpServerError,
  HttpServerRouter
} from '@famir/http-server'
import { HttpMessage } from '@famir/http-tools'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { pipeline } from 'node:stream'
import { BaseController } from '../base/index.js'
import { ROUND_TRIP_SERVICE, RoundTripService } from './round-trip.service.js'

export const ROUND_TRIP_CONTROLLER = Symbol('RoundTripController')

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
          c.resolve<RoundTripService>(ROUND_TRIP_SERVICE)
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
    protected readonly roundTripService: RoundTripService
  ) {
    super(validator, logger, router)

    this.logger.debug(`RoundTripController initialized`)
  }

  useInit() {
    this.router.register('round-trip-init', async (ctx, next) => {
      const message = new HttpMessage(
        ctx.method,
        ctx.url.clone(),
        ctx.requestHeaders.clone().reset(),
        ctx.requestBody.clone().reset(),
        ctx.status.clone().reset(),
        ctx.responseHeaders.clone().reset(),
        ctx.responseBody.clone().reset()
      )

      this.setState(ctx, 'message', message)

      if (isDevelopment) {
        ctx.responseHeaders.set('X-Famir-Message-Id', message.id)
      }

      await next()
    })
  }

  useForward() {
    this.router.register('round-trip-forward', async (ctx, next) => {
      const target = this.getState(ctx, 'target')
      const proxy = this.getState(ctx, 'proxy')
      const message = this.getState(ctx, 'message')

      message.ready()

      if (message.isKind('simple')) {
        await ctx.loadRequest(target.requestSizeLimit)

        this.copyMessageRequestHead(ctx, message)
        this.copyMessageRequestBody(ctx, message)

        message.runRequestHeadInterceptors()
        message.runRequestBodyInterceptors()

        const result = await this.roundTripService.simpleForward({
          connectTimeout: target.connectTimeout,
          timeout: target.simpleTimeout,
          proxy: proxy.url,
          method: message.method.get(),
          url: message.url.toAbsolute(),
          requestHeaders: message.requestHeaders.toObject(),
          requestBody: message.requestBody.get(),
          sizeLimit: target.responseSizeLimit
        })

        if (result.error) {
          this.copyMessageError(message, result, 'forward', 'simple')

          await this.sendMessageError(ctx, result, true)
        } else {
          this.copyMessageResponseHead(message, result)
          this.copyMessageResponseBody(message, result)

          message.runResponseHeadInterceptors()
          message.runResponseBodyInterceptors()

          await this.sendMessageResponseSimple(ctx, message)
        }
      } else if (message.isKind('stream-request')) {
        this.copyMessageRequestHead(ctx, message)

        message.runRequestHeadInterceptors()

        const result = await this.roundTripService.streamRequestForward({
          connectTimeout: target.connectTimeout,
          timeout: target.streamTimeout,
          proxy: proxy.url,
          method: message.method.get(),
          url: message.url.toAbsolute(),
          requestHeaders: message.requestHeaders.toObject(),
          requestStream: ctx.requestStream,
          sizeLimit: target.responseSizeLimit
        })

        if (result.error) {
          this.copyMessageError(message, result, 'forward', 'stream-request')

          await this.sendMessageError(ctx, result, false)
        } else {
          this.copyMessageResponseHead(message, result)
          this.copyMessageResponseBody(message, result)

          message.runResponseHeadInterceptors()
          message.runResponseBodyInterceptors()

          await this.sendMessageResponseSimple(ctx, message)
        }
      } else if (message.isKind('stream-response')) {
        await ctx.loadRequest(target.requestSizeLimit)

        this.copyMessageRequestHead(ctx, message)
        this.copyMessageRequestBody(ctx, message)

        message.runRequestHeadInterceptors()
        message.runRequestBodyInterceptors()

        const result = await this.roundTripService.streamResponseForward({
          connectTimeout: target.connectTimeout,
          timeout: target.streamTimeout,
          proxy: proxy.url,
          method: message.method.get(),
          url: message.url.toAbsolute(),
          requestHeaders: message.requestHeaders.toObject(),
          requestBody: message.requestBody.get(),
          sizeLimit: target.responseSizeLimit
        })

        if (result.error) {
          this.copyMessageError(message, result, 'forward', 'stream-response')

          await this.sendMessageError(ctx, result, false)
        } else {
          this.copyMessageResponseHead(message, result)

          message.runResponseHeadInterceptors()

          await this.sendMessageResponseStream(ctx, message, result)
        }
      } else {
        throw new HttpServerError(`Server internal error`, {
          context: {
            reason: `Message kind not known`,
            messageKind: message.getKind()
          },
          code: 'INTERNAL_ERROR'
        })
      }

      await next()
    })
  }

  useSaveLog() {
    this.router.register('round-trip-save-log', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const proxy = this.getState(ctx, 'proxy')
      const target = this.getState(ctx, 'target')
      const session = this.getState(ctx, 'session')
      const message = this.getState(ctx, 'message')

      await this.roundTripService.createMessage({
        campaignId: campaign.campaignId,
        messageId: message.id,
        proxyId: proxy.proxyId,
        targetId: target.targetId,
        sessionId: session.sessionId,
        kind: message.getKind(),
        method: message.method.get(),
        url: message.url.toRelative(),
        requestHeaders: message.requestHeaders.toObject(),
        requestBody: message.requestBody.get(),
        status: message.status.get(),
        responseHeaders: message.responseHeaders.toObject(),
        responseBody: message.responseBody.get(),
        connection: message.connection,
        payload: message.payload,
        errors: message.errors,
        score: message.score,
        ip: ctx.ip,
        startTime: ctx.startTime,
        finishTime: ctx.finishTime
      })

      //await this.roundTripService.addAnalyzeLogJob()

      await next()
    })
  }

  protected copyMessageRequestHead(ctx: HttpServerContext, message: HttpMessage) {
    message.url.merge(ctx.url.toObject())
    message.requestHeaders.merge(ctx.requestHeaders.toObject())
    message.mergeConnection(ctx.connection)
  }

  protected copyMessageRequestBody(ctx: HttpServerContext, message: HttpMessage) {
    message.requestBody.set(ctx.requestBody.get())
  }

  protected copyMessageResponseHead(message: HttpMessage, result: HttpClientBaseResult) {
    message.status.set(result.status)
    message.responseHeaders.merge(result.responseHeaders)
    message.mergeConnection(result.connection)
  }

  protected copyMessageResponseBody(message: HttpMessage, result: HttpClientSimpleResult) {
    message.responseBody.set(result.responseBody)
  }

  protected async sendMessageResponseSimple(
    ctx: HttpServerContext,
    message: HttpMessage
  ): Promise<void> {
    ctx.status.set(message.status.get())
    ctx.responseHeaders.merge(message.responseHeaders.toObject())
    ctx.responseBody.set(message.responseBody.get())

    await ctx.sendResponse()
  }

  protected async sendMessageResponseStream(
    ctx: HttpServerContext,
    message: HttpMessage,
    result: HttpClientStreamResult
  ): Promise<void> {
    ctx.status.set(message.status.get())
    ctx.responseHeaders.merge(message.responseHeaders.toObject())

    ctx.sendHead()

    pipeline(result.responseStream, ctx.responseStream, (error) => {
      console.log('RoundTrip pipeline error:', error)

      if (!result.responseStream.destroyed) {
        result.responseStream.destroy()
      }

      if (!ctx.responseStream.writableEnded) {
        ctx.responseStream.end()
      }
    })
  }

  protected copyMessageError(
    message: HttpMessage,
    result: HttpClientErrorResult,
    ...path: string[]
  ) {
    message.addError(result.error, ...path)
    message.mergeConnection(result.connection)
  }

  protected async sendMessageError(
    ctx: HttpServerContext,
    result: HttpClientErrorResult,
    isHtml: boolean
  ): Promise<void> {
    ctx.status.set(result.error.status)

    if (isHtml) {
      const errorPage = this.templater.render(HTTP_SERVER_ERROR_PAGE, {
        status: result.error.status,
        message: result.error.message
      })

      ctx.responseHeaders.set('Content-Type', 'text/html')
      ctx.responseBody.setText(errorPage)
    } else {
      ctx.responseHeaders.set('Content-Type', 'text/plain')
      ctx.responseBody.setText(result.error.message)
    }

    ctx.responseHeaders.set('Content-Length', ctx.responseBody.length.toString())

    await ctx.sendResponse()
  }
}

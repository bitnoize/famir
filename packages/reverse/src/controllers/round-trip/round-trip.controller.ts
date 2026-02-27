import { DIContainer } from '@famir/common'
import { HttpClientError } from '@famir/http-client'
import {
  HTTP_SERVER_ROUTER,
  HttpServerContext,
  HttpServerError,
  HttpServerRouter
} from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { PassThrough, pipeline as pipelineSync } from 'node:stream'
import { pipeline as pipelineAsync } from 'node:stream/promises'
import { ReverseMessage } from '../../reverse-message.js'
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
      const message = new ReverseMessage(
        ctx.method,
        ctx.url.clone(),
        ctx.requestHeaders.clone().reset(),
        ctx.requestBody.clone().reset(),
        ctx.status.clone().reset(),
        ctx.responseHeaders.clone().reset(),
        ctx.responseBody.clone().reset()
      )

      this.setState(ctx, 'message', message)

      if (ctx.verbose) {
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

        message.url.merge(ctx.url.toObject())
        message.requestHeaders.merge(ctx.requestHeaders.toObject())
        message.mergeConnection(ctx.connection)

        message.runRequestHeadInterceptors()

        message.requestBody.set(ctx.requestBody.get())

        message.runRequestBodyInterceptors()

        const result = await this.roundTripService.simpleForward({
          connectTimeout: target.connectTimeout,
          timeout: target.simpleTimeout,
          proxy: proxy.url,
          method: message.method.get(),
          url: message.url.toAbsolute(),
          requestHeaders: message.requestHeaders.toObject(),
          requestBody: message.requestBody.get(),
          responseSizeLimit: target.responseSizeLimit
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
      } else if (message.isKind('stream-request')) {
        message.url.merge(ctx.url.toObject())
        message.requestHeaders.merge(ctx.requestHeaders.toObject())
        message.mergeConnection(ctx.connection)

        message.runRequestHeadInterceptors()

        const requestStream = new PassThrough()

        pipelineSync(
          ctx.requestStream,
          ...message.getRequestTransforms(),
          requestStream,
          (error) => {
            if (error) {
              message.addError(error, 'forward', 'stream-request', 'pipeline')
            }
          }
        )

        const result = await this.roundTripService.streamRequestForward({
          connectTimeout: target.connectTimeout,
          timeout: target.streamTimeout,
          proxy: proxy.url,
          method: message.method.get(),
          url: message.url.toAbsolute(),
          requestHeaders: message.requestHeaders.toObject(),
          requestStream,
          responseSizeLimit: target.responseSizeLimit
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
      } else if (message.isKind('stream-response')) {
        await ctx.loadRequest(target.requestSizeLimit)

        message.url.merge(ctx.url.toObject())
        message.requestHeaders.merge(ctx.requestHeaders.toObject())
        message.mergeConnection(ctx.connection)

        message.runRequestHeadInterceptors()

        message.requestBody.set(ctx.requestBody.get())

        message.runRequestBodyInterceptors()

        const result = await this.roundTripService.streamResponseForward({
          connectTimeout: target.connectTimeout,
          timeout: target.streamTimeout,
          proxy: proxy.url,
          method: message.method.get(),
          url: message.url.toAbsolute(),
          requestHeaders: message.requestHeaders.toObject(),
          requestBody: message.requestBody.get(),
          responseSizeLimit: target.responseSizeLimit
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
            await pipelineAsync(
              result.responseStream,
              ...message.getResponseTransforms(),
              ctx.responseStream
            )
          } catch (error) {
            message.addError(error, 'forward', 'stream-response', 'pipeline')
          }
        }
      } else {
        throw new HttpServerError(`Server internal error`, {
          context: {
            reason: `Reverse message kind not known`,
            messageKind: message.getKind()
          },
          code: 'INTERNAL_ERROR'
        })
      }

      await next()
    })
  }

  useAnalyze() {
    this.router.register('round-trip-analyze', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const proxy = this.getState(ctx, 'proxy')
      const target = this.getState(ctx, 'target')
      const session = this.getState(ctx, 'session')
      const message = this.getState(ctx, 'message')

      if (message.analyze) {
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

        await this.roundTripService.addAnalyzeJob(message.analyze, {
          campaignId: campaign.campaignId,
          messageId: message.id
        })
      }

      await next()
    })
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

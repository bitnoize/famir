import { DIContainer, isDevelopment } from '@famir/common'
import {
  HTTP_SERVER_ERROR_PAGE,
  HTTP_SERVER_ROUTER,
  HttpServerError,
  HttpServerRouter
} from '@famir/http-server'
import { HttpMessage } from '@famir/http-tools'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { type RoundTripService, ROUND_TRIP_SERVICE } from './round-trip.service.js'
import { pipeline } from 'node:stream/promises';

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
        await ctx.loadRequest(target.requestBodyLimit)

        message.url.merge(ctx.url.toObject())
        message.requestHeaders.merge(ctx.requestHeaders.toObject())
        message.requestBody.set(ctx.requestBody.get())
        message.mergeConnection(ctx.connection)

        message.runRequestInterceptors()

        const response = await this.roundTripService.simpleForward({
          proxy: proxy.url,
          method: message.method.get(),
          url: message.url.toAbsolute(),
          headers: message.requestHeaders.toObject(),
          body: message.requestBody.get(),
          connectTimeout: target.connectTimeout,
          timeout: target.simpleTimeout,
          bodyLimit: target.responseBodyLimit
        })

        if (response.error) {
          message.addError(response.error, 'simple-forward')
          message.mergeConnection(response.connection)

          ctx.status.set(response.error.status)

          const errorPage = this.templater.render(HTTP_SERVER_ERROR_PAGE, {
            status: response.error.status,
            message: response.error.message
          })
          ctx.responseBody.setText(errorPage)

          ctx.responseHeaders.merge({
            'Content-Type': 'text/html',
            'Content-Length': ctx.responseBody.length.toString()
          })

          await ctx.sendResponse()
        } else {
          message.status.set(response.status)
          message.responseHeaders.merge(response.headers)
          message.responseBody.set(response.body)
          message.mergeConnection(response.connection)

          message.runResponseInterceptors()

          ctx.status.set(message.status.get())
          ctx.responseHeaders.merge(message.responseHeaders.toObject())
          ctx.responseBody.set(message.responseBody.get())

          await ctx.sendResponse()
        }
      } else if (message.isKind('stream-request')) {
        message.url.merge(ctx.url.toObject())
        message.requestHeaders.merge(ctx.requestHeaders.toObject())
        message.mergeConnection(ctx.connection)

        message.runRequestInterceptors()

        const response = await this.roundTripService.streamRequestForward({
          proxy: proxy.url,
          method: message.method.get(),
          url: message.url.toAbsolute(),
          headers: message.requestHeaders.toObject(),
          stream: ctx.requestStream,
          connectTimeout: target.connectTimeout,
          timeout: target.streamTimeout,
          bodyLimit: target.responseBodyLimit
        })

        if (response.error) {
          message.addError(response.error, 'stream-request-forward')
          message.mergeConnection(response.connection)

          ctx.status.set(response.error.status)

          ctx.responseBody.setText(response.error.message)

          ctx.responseHeaders.merge({
            'Content-Type': 'text/plain',
            'Content-Length': ctx.responseBody.length.toString()
          })

          await ctx.sendResponse()
        } else {
          message.status.set(response.status)
          message.responseHeaders.merge(response.headers)
          message.responseBody.set(response.body)
          message.mergeConnection(response.connection)

          message.runResponseInterceptors()

          ctx.status.set(message.status.get())
          ctx.responseHeaders.merge(message.responseHeaders.toObject())
          ctx.responseBody.set(message.responseBody.get())

          await ctx.sendResponse()
        }
      } else if (message.isKind('stream-response')) {
        await ctx.loadRequest(target.requestBodyLimit)

        message.url.merge(ctx.url.toObject())
        message.requestHeaders.merge(ctx.requestHeaders.toObject())
        message.requestBody.set(ctx.requestBody.get())
        message.mergeConnection(ctx.connection)

        message.runRequestInterceptors()

        const response = await this.roundTripService.streamResponseForward({
          proxy: proxy.url,
          method: message.method.get(),
          url: message.url.toAbsolute(),
          headers: message.requestHeaders.toObject(),
          body: message.requestBody.get(),
          connectTimeout: target.connectTimeout,
          timeout: target.streamTimeout,
          bodyLimit: target.responseBodyLimit
        })

        if (response.error) {
          message.addError(response.error, 'stream-response-forward')
          message.mergeConnection(response.connection)

          ctx.status.set(response.error.status)

          ctx.responseBody.setText(response.error.message)

          ctx.responseHeaders.merge({
            'Content-Type': 'text/plain',
            'Content-Length': ctx.responseBody.length.toString()
          })

          await ctx.sendResponse()
        } else {
          message.status.set(response.status)
          message.responseHeaders.merge(response.headers)
          message.mergeConnection(response.connection)

          message.runResponseInterceptors()

          ctx.status.set(message.status.get())
          ctx.responseHeaders.merge(message.responseHeaders.toObject())

          ctx.sendHead()

          await pipeline(response.stream, ctx.responseStream)
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
}

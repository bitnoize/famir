import { DIContainer, isDevelopment } from '@famir/common'
import { HTTP_SERVER_ROUTER, HttpServerRouter } from '@famir/http-server'
import { HttpMessage } from '@famir/http-tools'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { type RoundTripService, ROUND_TRIP_SERVICE } from './round-trip.service.js'

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

      if (message.kind === 'simple') {
        await ctx.loadRequest(target.requestBodyLimit)

        message.url.merge(ctx.url.toObject())
        message.requestHeaders.merge(ctx.requestHeaders.toObject())
        message.requestBody.set(ctx.requestBody.get())
        message.mergeConnection(ctx.connection)

        message.runRequestInterceptors(true)

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

        message.status.set(response.status)
        message.responseHeaders.merge(response.headers)
        message.responseBody.set(response.body)
        message.mergeConnection(response.connection)

        if (response.error) {
          message.addError(response.error, 'simple-forward')

          ctx.status.set(response.error.status)

          const errorPage = this.templater.render(ctx.errorPage, {
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
          message.runResponseInterceptors(true)

          ctx.status.set(message.status.get())
          ctx.responseHeaders.merge(message.responseHeaders.toObject())
          ctx.responseBody.set(message.responseBody.get())

          await ctx.sendResponse()
        }
      } else if (message.kind === 'stream') {
        throw new Error(`Streaming not supported yet`)
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
        kind: message.kind,
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

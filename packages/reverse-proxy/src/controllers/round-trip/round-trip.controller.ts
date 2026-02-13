import { DIContainer, isDevelopment } from '@famir/common'
import { HTTP_SERVER_ROUTER, HttpServerRouter } from '@famir/http-server'
import { HttpMessage } from '@famir/http-tools'
import { Logger, LOGGER } from '@famir/logger'
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
    router: HttpServerRouter,
    protected readonly roundTripService: RoundTripService
  ) {
    super(validator, logger, router)

    this.logger.debug(`RoundTripController initialized`)
  }

  useInitMessage() {
    this.router.register('init-message', async (ctx, next) => {
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

  useForwardMessage() {
    this.router.register('forward-message', async (ctx, next) => {
      const target = this.getState(ctx, 'target')
      const proxy = this.getState(ctx, 'proxy')
      const message = this.getState(ctx, 'message')

      message.freeze()

      if (message.kind === 'ordinary') {
        await ctx.loadRequest(target.requestBodyLimit)

        message.url.merge(ctx.url.toObject())
        message.requestHeaders.merge(ctx.requestHeaders.toObject())
        message.requestBody.set(ctx.requestBody.get())
        message.mergeConnection({}) // FIXME

        message.runRequestInterceptors(true)

        const response = await this.roundTripService.ordinaryRequest({
          proxy: proxy.url,
          method: message.method.get(),
          url: message.url.toAbsolute(),
          headers: message.requestHeaders.toObject(),
          body: message.requestBody.get(),
          connectTimeout: target.connectTimeout,
          timeout: target.ordinaryTimeout,
          bodyLimit: target.responseBodyLimit
        })

        message.status.set(response.status)
        message.responseHeaders.merge(response.headers)
        message.responseBody.set(response.body)
        message.mergeConnection(response.connection)

        if (response.error) {
          message.addError(response.error, 'ordinary-request')

          ctx.status.set(message.status.get())

          ctx.responseBody.setText(`Gateway error`)

          ctx.responseHeaders.merge({
            'Content-Type': 'text/plain',
            'Content-Length': ctx.responseBody.size.toString()
          })

          await ctx.sendResponse()
        } else {
          message.runResponseInterceptors(true)

          ctx.status.set(message.status.get())
          ctx.responseHeaders.merge(message.responseHeaders.toObject())
          ctx.responseBody.set(message.responseBody.get())

          await ctx.sendResponse()
        }
      } else if (message.kind === 'stream-request') {
        throw new Error(`Streaming not supported yet`)
      } else if (message.kind === 'stream-response') {
        throw new Error(`Streaming not supported yet`)
      }

      await next()
    })
  }

  useBasicTransforms() {
    this.router.register('basic-transforms', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')
      const message = this.getState(ctx, 'message')

      message.addRequestHeadInterceptor('target-donor-url', () => {
        message.url.merge({
          protocol: target.donorProtocol,
          hostname: target.donorHostname,
          port: target.donorPort.toString()
        })

        message.requestHeaders.set('Host', target.donorHost)
      })

      message.addRequestHeadInterceptor('remove-session-cookie', () => {
        const cookies = message.requestHeaders.getCookies()

        if (cookies) {
          cookies[campaign.sessionCookieName] = undefined
          message.requestHeaders.setCookies(cookies)
        }
      })

      message.addRequestHeadInterceptor('cleanup-headers', () => {
        message.requestHeaders.delete([
          'Via',
          'X-Real-Ip',
          'X-Forwarded-For',
          'X-Forwarded-Host',
          'X-Forwarded-Proto',
          'X-Famir-Campaign-Id',
          'X-Famir-Target-Id'
          // ...
        ])
      })

      message.addResponseHeadInterceptor('cleanup-headers', () => {
        message.responseHeaders.delete([
          'Proxy-Agent'
          // ...
        ])
      })

      await next()
    })
  }

  /*
  useRewriteHtmlUrl() {
    this.router.register('rewrite-html-url', async (ctx, next) => {
      const target = this.getState(ctx, 'target')
      const targets = this.getState(ctx, 'targets')
      const message = this.getState(ctx, 'message')

      message.addRequestBodyInterceptor('rewrite-html-url', () => {
        const contentType = message.responseHeaders.getContentType()

        if (message.rewriteHtmlUrl.isEnabled && contentType) {
          if (message.rewriteHtmlUrls.types.includes(contentType.type)) {
            const charset = contentType.parameters['charset']
            const fromText = message.requestBody.getText(charset)
            const cheerio = cheerioLoad(fromText)

            rewriteHtmlUrls(
              cheerio,
              true,
              targets,
              message.rewriteHtmlUrls.schemes,
              message.rewriteHtmlUrls.tags
            )

            const toText = cheerio.html()
            message.requestBody.setText(toText)
          }
        }
      })

      await next()
    })
  }
  */

  useCreateMessage() {
    this.router.register('create-message', async (ctx, next) => {
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

      await next()
    })
  }
}

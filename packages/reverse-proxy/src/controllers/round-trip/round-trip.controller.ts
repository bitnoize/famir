import { DIContainer, isDevelopment } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { ReverseProxyForward } from '../../reverse-proxy-forward.js'
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

  useInitForward() {
    this.router.register('init-forward', async (ctx, next) => {
      const forward = new ReverseProxyForward(
        ctx.method,
        ctx.url.clone(),
        ctx.requestHeaders.clone().reset(),
        ctx.requestBody.clone().reset(),
        ctx.status.clone().reset(),
        ctx.responseHeaders.clone().reset(),
        ctx.responseBody.clone().reset()
      )

      this.setState(ctx, 'forward', forward)

      if (isDevelopment) {
        ctx.responseHeaders.set('X-Famir-Message-Id', forward.message.id)
      }

      await next()
    })
  }

  useExecForward() {
    this.router.register('exec-forward', async (ctx, next) => {
      const target = this.getState(ctx, 'target')
      const proxy = this.getState(ctx, 'proxy')
      const forward = this.getState(ctx, 'forward')

      const message = forward.freeze().message

      if (forward.kind === 'ordinary') {
        await ctx.loadRequest(target.requestBodyLimit)

        message.url.merge(ctx.url.toObject())
        message.requestHeaders.merge(ctx.requestHeaders.toObject())
        message.requestBody.set(ctx.requestBody.get())
        message.mergeConnection({}) // FIXME

        forward.runRequestInterceptors(true)

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
          forward.runResponseInterceptors(true)

          ctx.status.set(message.status.get())
          ctx.responseHeaders.merge(message.responseHeaders.toObject())
          ctx.responseBody.set(message.responseBody.get())

          await ctx.sendResponse()
        }
      } else if (forward.kind === 'stream-request') {
        throw new Error(`Streaming not supported yet`)
      } else if (forward.kind === 'stream-response') {
        throw new Error(`Streaming not supported yet`)
      }

      await next()
    })
  }

  useBasicTransforms() {
    this.router.register('basicTransforms', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')
      const forward = this.getState(ctx, 'forward')

      forward.addRequestHeadInterceptor('target-donor-url', (message) => {
        message.url.merge({
          protocol: target.donorProtocol(),
          hostname: target.donorHostname(),
          port: target.donorPort.toString()
        })

        message.requestHeaders.set('Host', target.donorHost())
      })

      forward.addRequestHeadInterceptor('remove-session-cookie', (message) => {
        const requestCookies = message.requestHeaders.getCookies()
        requestCookies[campaign.sessionCookieName] = undefined
        message.requestHeaders.setCookies(requestCookies)
      })

      forward.addRequestHeadInterceptor('cleanup-headers', (message) => {
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

      forward.addResponseHeadInterceptor('cleanup-headers', (message) => {
        message.responseHeaders.delete([
          'Proxy-Agent'
          // ...
        ])
      })

      await next()
    })
  }
}

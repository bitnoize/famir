import { DIContainer, isDevelopment } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { ReverseProxyForward } from '../../reverse-proxy-forward.js'
import { BaseController } from '../base/index.js'
import { type ForwardingService, FORWARDING_SERVICE } from './forwarding.service.js'

export const FORWARDING_CONTROLLER = Symbol('ForwardingController')

export class ForwardingController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      FORWARDING_CONTROLLER,
      (c) =>
        new ForwardingController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<ForwardingService>(FORWARDING_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): ForwardingController {
    return container.resolve(FORWARDING_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter,
    protected readonly forwardingService: ForwardingService
  ) {
    super(validator, logger, router)

    this.logger.debug(`ForwardingController initialized`)
  }

  registerPrepare(): this {
    this.router.register('prepare', this.prepareMiddleware)

    return this
  }

  registerExecute(): this {
    this.router.register('execute', this.executeMiddleware)

    return this
  }

  registerDefaultIntercetors(): this {
    this.router.register('defaultIntercetors', this.defaultIntercetorsMiddleware)

    return this
  }

  private prepareMiddleware: HttpServerMiddleware = async (ctx, next) => {
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
  }

  private executeMiddleware: HttpServerMiddleware = async (ctx, next) => {
    const target = this.getState(ctx, 'target')
    const proxy = this.getState(ctx, 'proxy')
    const forward = this.getState(ctx, 'forward')

    await ctx.loadRequest(target.requestBodyLimit)

    const message = forward.freeze().message

    message.url.merge(ctx.url.toObject())
    message.requestHeaders.merge(ctx.requestHeaders.toObject())
    message.requestBody.set(ctx.requestBody.get())
    message.mergeConnection({}) // FIXME

    forward.runRequestInterceptors(true)

    const response = await this.forwardingService.ordinaryRequest({
      proxy: proxy.url,
      method: message.method.get(),
      url: message.url.toString(true),
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

      const contentType = ctx.responseHeaders
        .setContentType({ type: 'text/html', parameters: {} })
        .getContentType()

      ctx.responseBody.setText(`<html></html>`, contentType)

      await ctx.sendResponse()
    } else {
      forward.runResponseInterceptors(true)

      ctx.status.set(message.status.get())
      ctx.responseHeaders.merge(message.responseHeaders.toObject())
      ctx.responseBody.set(message.responseBody.get())

      await ctx.sendResponse()
    }

    await next()
  }

  private defaultIntercetorsMiddleware: HttpServerMiddleware = async (ctx, next) => {
    const campaign = this.getState(ctx, 'campaign')
    const target = this.getState(ctx, 'target')
    const forward = this.getState(ctx, 'forward')

    forward.addRequestHeadInterceptor('replace-target-donor-url', (message) => {
      message.url.merge({
        protocol: target.donorProtocol(),
        hostname: target.donorHostname(),
        port: target.donorPort.toString()
      })

      message.requestHeaders.set('Host', target.donorHost()).delete([
        'X-Famir-Campaign-Id',
        'X-Famir-Target-Id',
        'X-Forwarded-For',
        'X-Forwarded-Host',
        'X-Forwarded-Proto'
        // ...
      ])

      const requestCookies = message.requestHeaders.getCookies()
      requestCookies[campaign.sessionCookieName] = undefined
      message.requestHeaders.setCookies(requestCookies)
    })

    forward.addResponseHeadInterceptor('cleanup-headers', (message) => {
      message.responseHeaders.delete([
        'Proxy-Agent',
        'Content-Encoding'
        // ...
      ])
    })

    await next()
  }
}

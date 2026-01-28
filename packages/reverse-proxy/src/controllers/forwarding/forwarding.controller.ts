import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
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

    this.router.register('forwarding', this.forwarding)
  }

  protected forwarding: HttpServerMiddleware = async (ctx, next) => {
    const target = this.getState(ctx, 'target')
    const proxy = this.getState(ctx, 'proxy')
    const message = this.getState(ctx, 'message')

    message.runRequestHooks()

    if (message.isStream) {
      throw new Error(`Streaming not supported yet`)
    } else {
      const { responseHeaders, responseBody, status, connection } =
        await this.forwardingService.ordinaryRequest({
          proxy: proxy.url,
          method: message.method.get(),
          url: message.url.toString(),
          requestHeaders: message.requestHeaders.toObject(),
          requestBody: message.requestBody.get(),
          connectTimeout: target.connectTimeout,
          ordinaryTimeout: target.ordinaryTimeout,
          responseBodyLimit: target.responseBodyLimit
        })

      message.responseHeaders.merge(responseHeaders)
      message.responseBody.set(responseBody)

      message.initResponse()

      message.runResponseHooks()

      ctx.responseHeaders.merge(message.responseHeaders)
      ctx.responseBody.set(message.responseBody)

      await ctx.sendResponse(message.status)
    }

    await next()
  }
}

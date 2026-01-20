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
import { formatUrl, setHeaders } from '@famir/http-tools'
import { BaseController } from '../base/index.js'
import { type BuildResponseService, BUILD_RESPONSE_SERVICE } from './build-response.service.js'

export const BUILD_RESPONSE_CONTROLLER = Symbol('BuildResponseController')

export class BuildResponseController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      BUILD_RESPONSE_CONTROLLER,
      (c) =>
        new BuildResponseController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<BuildResponseService>(BUILD_RESPONSE_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): BuildResponseController {
    return container.resolve(BUILD_RESPONSE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter,
    protected readonly buildResponseService: BuildResponseService
  ) {
    super(validator, logger, router)

    this.router.register('buildResponse', this.buildResponse)
  }

  protected buildResponse: HttpServerMiddleware = async (ctx, next) => {
    const target = this.getState(ctx, 'target')
    const proxy = this.getState(ctx, 'proxy')
    const message = this.getState(ctx, 'message')

    const { status, responseHeaders, responseBody, connection } =
      await this.buildResponseService.ordinaryRequest({
        proxy: proxy.url,
        method: message.method,
        url: formatUrl(message.url),
        requestHeaders: message.requestHeaders,
        requestBody: message.requestBody,
        connectTimeout: target.connectTimeout,
        ordinaryTimeout: target.ordinaryTimeout,
        responseBodyLimit: target.responseBodyLimit
      })

    message.responseHeaders = responseHeaders
    message.responseBody = responseBody
    message.status = status
    message.connection = connection

    setHeaders(message.responseHeaders, {
      'proxy-agent': undefined,
      'content-encoding': undefined,
      // ...
    })

    setHeaders(ctx.responseHeaders, message.responseHeaders)

    await ctx.sendResponseBody(message.status, message.responseBody)

    await next()
  }
}

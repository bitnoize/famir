import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  TARGET_SUB_ROOT,
  TargetModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { type BuildResponseService, BUILD_RESPONSE_SERVICE } from './build-response.service.js'

export const BUILD_RESPONSE_CONTROLLER = Symbol('BuildResponseController')

export class BuildResponseController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<BuildResponseController>(
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
    return container.resolve<BuildResponseController>(BUILD_RESPONSE_CONTROLLER)
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

    ctx.applyRequestWrappers()

    if (ctx.isStreaming) {
      throw new Error(`Streaming requests not implemented yet :(`)
    } else {
      const { status, responseHeaders, responseBody, connection } =
        await this.buildResponseService.ordinaryRequest({
          proxy: proxy.url,
          method: ctx.method,
          url: this.assemblyUrl(target, ctx.normalizeUrl()),
          requestHeaders: ctx.requestHeaders,
          requestBody: ctx.requestBody,
          connectTimeout: target.connectTimeout,
          ordinaryTimeout: target.ordinaryTimeout,
          responseBodyLimit: target.responseBodyLimit
        })

      ctx.setResponseHeaders(responseHeaders)
      ctx.setResponseBody(responseBody)
      ctx.setStatus(status)
      //ctx.setConnection(connection)

      /*
      ctx.setResponseHeaders({
        Connection: undefined,
        'Keep-Alive': undefined,
        Upgrade: undefined,
        'Set-Cookie': undefined
      })
      */

      ctx.applyResponseWrappers()

      await ctx.sendResponse()
    }

    await next()
  }

  private assemblyUrl(target: TargetModel, relativeUrl: string): string {
    return [
      target.donorSecure ? 'https:' : 'http:',
      '//',
      target.donorSub !== TARGET_SUB_ROOT ? target.donorSub + '.' : '',
      target.donorDomain,
      ':',
      target.donorPort.toString(),
      relativeUrl
    ].join('')
  }
}

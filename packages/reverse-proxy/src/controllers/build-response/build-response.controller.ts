import { DIContainer } from '@famir/common'
import {
  TARGET_SUB_ROOT,
  TargetModel,
  HTTP_SERVER_ROUTER,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'

export const BUILD_RESPONSE_CONTROLLER = Symbol('BuildResponseController')

export class BuildResponseController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<BuildResponseController>(
      BUILD_RESPONSE_CONTROLLER,
      (c) =>
        new BuildResponseController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  static resolve(container: DIContainer): BuildResponseController {
    return container.resolve<BuildResponseController>(BUILD_RESPONSE_CONTROLLER)
  }

  constructor(validator: Validator, logger: Logger, router: HttpServerRouter) {
    super(validator, logger, router, 'build-response')

    this.router.addMiddleware(this.defaultMiddleware)
  }

  private defaultMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.testConfigure(ctx.state)
      this.testAuthorize(ctx.state)

      const { campaign, target, proxy } = ctx.state

      //ctx.applyRequestWrappers()

      ctx.renewRequestCookieHeader()

      if (ctx.isStreaming) {
        throw new Error(`Streaming requests not implemented yet :(`)
      } else {
        const { status, headers, body } = await this.forwardRequestUseCase.execute({
          proxy: proxy.url,
          method: ctx.method,
          url: this.makeUrl(target, ctx.normalizeUrl()),
          headers: ctx.requestHeaders,
          body: ctx.requestBody,
          connectTimeout: target.connectTimeout,
          requestTimeout: target.requestTimeout,
          bodyLimit: target.responseBodyLimit,
        })

        ctx.prepareResponse(status, headers, body)
        
        //ctx.applyResponseWrappers()

        ctx.renewResponseSetCookieHeader()

        await ctx.sendResponse()
      }

      await next()
    } catch (error) {
      this.handleException(error, 'default')
    }
  }

  private makeUrl(target: TargetModel, relativeUrl: string): string {
    return [
      target.donorSecure ? 'https:' : 'http:',
      '//',
      target.donorSub !== TARGET_SUB_ROOT ? target.donorSub + '.' : '',
      target.donorDomain,
      ':',
      target.donorPort.toString(),
      relativeUrl,
    ].join('')
  }
}

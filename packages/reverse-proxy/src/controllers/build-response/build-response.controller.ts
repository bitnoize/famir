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
    super(validator, logger, router, 'build-response')

    this.router.addMiddleware(this.defaultMiddleware)
  }

  private defaultMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      const { target } = this.getSetupMirrorState(ctx)
      const { proxy } = this.getAuthorizeState(ctx)

      ctx.applyRequestWrappers()

      ctx.renewRequestCookieHeader()

      if (ctx.isStreaming) {
        throw new Error(`Streaming requests not implemented yet :(`)
      } else {
        const { status, headers, body, connection } =
          await this.buildResponseService.forwardRequest({
            proxy: proxy.url,
            method: ctx.method,
            url: this.assemblyUrl(target, ctx.normalizeUrl()),
            headers: ctx.requestHeaders,
            body: ctx.requestBody,
            connectTimeout: target.connectTimeout,
            timeout: target.requestTimeout,
            bodyLimit: target.responseBodyLimit
          })

        ctx.prepareResponse(status, headers, body, connection)

        ctx.setResponseHeaders({
          Connection: undefined,
          'Keep-Alive': undefined,
          Upgrade: undefined,
          'Set-Cookie': undefined
        })

        ctx.applyResponseWrappers()

        ctx.renewResponseSetCookieHeader()

        await ctx.sendResponse()
      }

      await next()
    } catch (error) {
      this.handleException(error, 'default')
    }
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

import { DIContainer } from '@famir/common'
import {
  HttpClientRequest,
  HttpClientResponse,
  TARGET_SUB_ROOT,
  HTTP_SERVER_ROUTER,
  HttpServerShare,
  HttpServerRequest,
  HttpServerRouter,
  Logger,
  LOGGER,
  Templater,
  TEMPLATER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { BUILD_RESPONSE_USE_CASE, BuildResponseUseCase } from './use-cases/index.js'

export const BUILD_RESPONSE_CONTROLLER = Symbol('BuildResponseController')

export class BuildResponseController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<BuildResponseController>(
      BUILD_RESPONSE_CONTROLLER,
      (c) =>
        new BuildResponseController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<BuildResponseUseCase>(BUILD_RESPONSE_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): BuildResponseController {
    return container.resolve<BuildResponseController>(BUILD_RESPONSE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter,
    protected readonly buildResponseUseCase: BuildResponseUseCase
  ) {
    super(validator, logger, templater, 'build-response')

    router.setHandler('all', '{*splat}', this.defaultHandler)
  }

  private readonly defaultHandler = async (share: HttpServerShare): Promise<void> => {
    try {
      this.existsShareProxy(share)
      this.existsShareTarget(share)

      const { request, response, proxy, target } = share

      const donorProto = target.donorSecure ? 'https:' : 'http:'

      const donorHostname = target.donorSub === TARGET_SUB_ROOT
        ? [target.donorSub, target.donorDomain].join('.')
        : target.donorDomain

      const donorHost = [donorHostname, target.donorPort.toString()].join(':')

      this.setRequestHeaders(share, {
        host: undefined,
      })

      const url = new URL([
        donorProto,
        '//',
        donorHost,
        request.path,
        request.query,
        request.hash,
      ].join(''))

      const clientRequest: HttpClientRequest = {
        proxy: proxy.url,
        method: request.method,
        url: url.toString(),
        headers: request.headers,
        cookies: request.cookies,
        body: request.body,
        connectTimeout: target.connectTimeout,
        timeout: target.timeout
      }


      const { clientResponse } = await this.buildResponseUseCase.execute({
        clientRequest
      })


      response.status = clientResponse.status
      response.body = clientResponse.body
      response.queryTime = clientResponse.queryTime

      this.setResponseHeaders(share, clientResponse.headers)
    } catch (error) {
      this.exceptionWrapper(error, 'default')
    }
  }
}

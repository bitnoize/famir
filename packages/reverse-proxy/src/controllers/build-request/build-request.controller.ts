import { DIContainer, isDevelopment, randomIdent } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import {
  getRequestCookies,
  getTargetDonorHost,
  refreshTargetDonorUrl,
  setHeader,
  setHeaders,
  setRequestCookies
} from '@famir/http-tools'
import { BaseController, ReverseProxyMessage } from '../base/index.js'

export const BUILD_REQUEST_CONTROLLER = Symbol('BuildRequestController')

export class BuildRequestController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      BUILD_REQUEST_CONTROLLER,
      (c) =>
        new BuildRequestController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  static resolve(container: DIContainer): BuildRequestController {
    return container.resolve(BUILD_REQUEST_CONTROLLER)
  }

  constructor(validator: Validator, logger: Logger, router: HttpServerRouter) {
    super(validator, logger, router)

    this.router.register('buildRequest', this.buildRequest)

    this.logger.debug(`BuildRequestController initialized`)
  }

  protected buildRequest: HttpServerMiddleware = async (ctx, next) => {
    const campaign = this.getState(ctx, 'campaign')
    const target = this.getState(ctx, 'target')

    const requestBody = await ctx.loadRequestBody(target.requestBodyLimit)

    const message: ReverseProxyMessage = {
      messageId: randomIdent(),
      method: ctx.method,
      url: { ...ctx.url },
      requestHeaders: { ...ctx.requestHeaders },
      requestBody,
      responseHeaders: {},
      responseBody: Buffer.alloc(0),
      status: 0,
      connection: {}
    }

    refreshTargetDonorUrl(message.url, target)

    setHeader(message.requestHeaders, 'Host', getTargetDonorHost(target))

    setHeaders(message.requestHeaders, {
      'X-Famir-Campaign-Id': undefined,
      'X-Famir-Target-Id': undefined,
      'X-Famir-Client-Ip': undefined,
      'X-Forwarded-For': undefined,
      'X-Forwarded-Host': undefined,
      'X-Forwarded-Proto': undefined,
      Via: undefined
      // ...
    })

    const requestCookies = getRequestCookies(message.requestHeaders)

    requestCookies[campaign.sessionCookieName] = undefined

    setRequestCookies(message.requestHeaders, requestCookies)

    if (isDevelopment) {
      setHeaders(ctx.responseHeaders, {
        'X-Famir-Message-Id': message.messageId
      })
    }

    this.setState(ctx, 'message', message)

    await next()
  }
}

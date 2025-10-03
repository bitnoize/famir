import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerResponse,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'

export const PREFLIGHT_CORS_CONTROLLER = Symbol('PreflightCorsController')

export class PreflightCorsController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<PreflightCorsController>(
      PREFLIGHT_CORS_CONTROLLER,
      (c) =>
        new PreflightCorsController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  static resolve(container: DIContainer): PreflightCorsController {
    return container.resolve<PreflightCorsController>(PREFLIGHT_CORS_CONTROLLER)
  }

  constructor(validator: Validator, logger: Logger, router: HttpServerRouter) {
    super(validator, logger, 'preflight-cors')

    router.setHandler('options', '{*splat}', this.defaultHandler)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private readonly defaultHandler = async (): Promise<HttpServerResponse | undefined> => {
    return {
      status: 204,
      headers: {
        'content-type': 'text/plain',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': '*',
        'access-control-allow-headers': '*',
        'access-control-expose-headers': '*',
        'access-control-allow-credentials': 'true',
        'access-control-max-age': '86400'
      },
      cookies: {},
      body: Buffer.from('')
    }
  }
}

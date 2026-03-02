import { DIContainer } from '@famir/common'
import { HTTP_SERVER_ROUTER, HttpServerRouter } from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { ReverseMessage } from '../../reverse-message.js'
import { BaseController } from '../base/index.js'

export const PREPARE_CONTROLLER = Symbol('PrepareController')

export class PrepareController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      PREPARE_CONTROLLER,
      (c) =>
        new PrepareController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  static resolve(container: DIContainer): PrepareController {
    return container.resolve(PREPARE_CONTROLLER)
  }

  constructor(validator: Validator, logger: Logger, router: HttpServerRouter) {
    super(validator, logger, router)

    this.logger.debug(`PrepareController initialized`)
  }

  use(): this {
    this.router.register('prepare', async (ctx, next) => {
      const message = new ReverseMessage(
        ctx.method,
        ctx.url.clone(),
        ctx.requestHeaders.clone().reset(),
        ctx.requestBody.clone().reset(),
        ctx.status.clone().reset(),
        ctx.responseHeaders.clone().reset(),
        ctx.responseBody.clone().reset()
      )

      this.setState(ctx, 'message', message)

      if (ctx.verbose) {
        ctx.responseHeaders.set('X-Famir-Message-Id', message.id)
      }

      await next()
    })

    return this
  }
}

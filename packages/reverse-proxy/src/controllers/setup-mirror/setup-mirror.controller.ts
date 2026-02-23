import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerContext,
  HttpServerError,
  HttpServerRouter
} from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { type SetupMirrorService, SETUP_MIRROR_SERVICE } from './setup-mirror.service.js'

export const SETUP_MIRROR_CONTROLLER = Symbol('SetupMirrorController')

export class SetupMirrorController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      SETUP_MIRROR_CONTROLLER,
      (c) =>
        new SetupMirrorController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<SetupMirrorService>(SETUP_MIRROR_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): SetupMirrorController {
    return container.resolve(SETUP_MIRROR_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter,
    protected readonly setupMirrorService: SetupMirrorService
  ) {
    super(validator, logger, router)

    this.logger.debug(`SetupMirrorController initialized`)
  }

  use() {
    this.router.register('setup-mirror', async (ctx, next) => {
      const mirrorHost = this.parseMirrorHost(ctx)

      const [campaign, target, targets] = await this.setupMirrorService.findTarget({
        mirrorHost
      })

      this.setState(ctx, 'campaign', campaign)
      this.setState(ctx, 'target', target)
      this.setState(ctx, 'targets', targets)

      if (ctx.verbose) {
        ctx.responseHeaders.merge({
          'X-Famir-Campaign-Id': target.campaignId,
          'X-Famir-Target-Id': target.targetId
        })
      }

      await next()
    })
  }

  private parseMirrorHost(ctx: HttpServerContext): string {
    try {
      const mirrorHost = ctx.requestHeaders.getString('Host')

      if (!(mirrorHost && /[^:]+:\d+$/.test(mirrorHost))) {
        throw new Error(`Host header malform`)
      }

      return mirrorHost
    } catch (error) {
      throw new HttpServerError(`Bad request`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }
}

import { DIContainer, isDevelopment } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerContext,
  HttpServerError,
  HttpServerRouter
} from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { SetupMirrorHeaders } from './setup-mirror.js'
import { setupMirrorSchemas } from './setup-mirror.schemas.js'
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

    this.validator.addSchemas(setupMirrorSchemas)

    this.logger.debug(`SetupMirrorController initialized`)
  }

  use() {
    this.router.register('setupMirror', async (ctx, next) => {
      const [campaignId, targetId] = this.parseSetupMirrorHeaders(ctx)

      const [campaign, target] = await this.setupMirrorService.readCampaignTarget({
        campaignId,
        targetId
      })

      const targets = await this.setupMirrorService.listTargets({ campaignId })

      this.setState(ctx, 'campaign', campaign)
      this.setState(ctx, 'target', target)
      this.setState(ctx, 'targets', targets)

      if (isDevelopment) {
        ctx.responseHeaders.merge({
          'X-Famir-Campaign-Id': campaignId,
          'X-Famir-Target-Id': targetId
        })
      }

      await next()
    })
  }

  private parseSetupMirrorHeaders(ctx: HttpServerContext): SetupMirrorHeaders {
    try {
      const headers = [
        ctx.requestHeaders.getString('X-Famir-Campaign-Id'),
        ctx.requestHeaders.getString('X-Famir-Target-Id')
      ]

      this.validator.assertSchema<SetupMirrorHeaders>('reverse-proxy-setup-mirror-headers', headers)

      return headers
    } catch (error) {
      throw new HttpServerError(`Service unavailable`, {
        cause: error,
        code: 'SERVICE_UNAVAILABLE'
      })
    }
  }
}

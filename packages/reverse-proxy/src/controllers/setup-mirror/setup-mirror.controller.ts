import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerContext,
  HttpServerError,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { getHeader, setHeaders } from '@famir/http-tools'
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

    this.router.register('setupMirror', this.setupMirror)

    this.logger.debug(`SetupMirrorController initialized`)
  }

  protected setupMirror: HttpServerMiddleware = async (ctx, next) => {
    const [campaignId, targetId] = this.parseSetupMirrorHeaders(ctx)

    const [campaign, target] = await this.setupMirrorService.readCampaignTarget({
      campaignId,
      targetId
    })

    const targets = await this.setupMirrorService.listTargets({
      campaignId
    })

    setHeaders(ctx.responseHeaders, {
      'X-Famir-Campaign-Id': campaignId,
      'X-Famir-Target-Id': targetId,
    })

    this.setState(ctx, 'campaign', campaign)
    this.setState(ctx, 'target', target)
    this.setState(ctx, 'targets', targets)

    await next()
  }

  protected parseSetupMirrorHeaders(ctx: HttpServerContext): SetupMirrorHeaders {
    try {
      const headers = [
        getHeader(ctx.requestHeaders, 'X-Famir-Campaign-Id'),
        getHeader(ctx.requestHeaders, 'X-Famir-Target-Id')
      ]

      this.validator.assertSchema<SetupMirrorHeaders>('reverse-proxy-setup-mirror-headers', headers)

      return headers
    } catch (error) {
      throw new HttpServerError(`SetupMirrorHeaders validate failed`, {
        cause: error,
        code: 'SERVICE_UNAVAILABLE'
      })
    }
  }
}

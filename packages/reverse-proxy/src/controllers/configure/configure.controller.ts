import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerError,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { ConfigureData } from './configure.js'
import { configureDataSchema } from './configure.schemas.js'
import { type ConfigureService, CONFIGURE_SERVICE } from './configure.service.js'

export const CONFIGURE_CONTROLLER = Symbol('ConfigureController')

export class ConfigureController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<ConfigureController>(
      CONFIGURE_CONTROLLER,
      (c) =>
        new ConfigureController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<ConfigureService>(CONFIGURE_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): ConfigureController {
    return container.resolve<ConfigureController>(CONFIGURE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter,
    protected readonly configureService: ConfigureService
  ) {
    super(validator, logger, router, 'configure')

    this.validator.addSchemas({
      'configure-data': configureDataSchema
    })

    this.router.addMiddleware(this.defaultMiddleware)
  }

  private defaultMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      if (this.isConfigureState(ctx)) {
        await next()

        return
      }

      const data = {
        campaignId: ctx.originHeaders['x-famir-campaign-id'],
        targetId: ctx.originHeaders['x-famir-target-id'],
        clientIp: ctx.originHeaders['x-famir-client-ip']
      }

      this.validateConfigureData(data)

      const { campaign, target, targets } = await this.configureService.execute(data)

      this.setConfigureState(ctx, campaign, target, targets)

      await next()
    } catch (error) {
      this.handleException(error, 'default')
    }
  }

  private validateConfigureData(value: unknown): asserts value is ConfigureData {
    try {
      this.validator.assertSchema<ConfigureData>('configure-data', value)
    } catch (error) {
      throw new HttpServerError(`ConfigureData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }
}

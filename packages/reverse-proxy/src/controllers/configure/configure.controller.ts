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
import { configureDataSchema } from './configure.schemas.js'
import { type ConfigureUseCase, CONFIGURE_USE_CASE } from './configure.use-case.js'
import { ConfigureData } from './configure.js'

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
          c.resolve<ConfigureUseCase>(CONFIGURE_USE_CASE)
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
    protected readonly configureUseCase: ConfigureUseCase
  ) {
    super(validator, logger, router, 'configure')

    this.validator.addSchemas({
      'configure-data': configureDataSchema
    })

    this.router.addMiddleware(this.defaultMiddleware)
  }

  private defaultMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      if (ctx.state['campaign']) {
        throw new Error(`State campaign exists`)
      }

      if (ctx.state['target']) {
        throw new Error(`State target exists`)
      }

      if (ctx.state['targets']) {
        throw new Error(`State targets exists`)
      }

      const data = {
        campaignId: ctx.getRequestHeader('X-Famir-Campaign-Id'),
        targetId: ctx.getRequestHeader('X-Famir-Target-Id'),
        clientIp: ctx.getRequestHeader('X-Famir-Client-Ip')
      }

      this.validateConfigureData(data)

      const { campaign, target, targets } = await this.configureUseCase.execute(data)

      ctx.state['campaign'] = campaign
      ctx.state['target'] = target
      ctx.state['targets'] = targets

      ctx.setRequestHeaders({
        'X-Famir-Campaign-Id': undefined,
        'X-Famir-Target-Id': undefined,
        'X-Famir-Client-Ip': undefined
      })

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

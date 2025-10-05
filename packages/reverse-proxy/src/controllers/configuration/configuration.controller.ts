import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerRequest,
  HttpServerResponse,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { addSchemas, validateConfigurationData } from './configuration.utils.js'
import { CONFIGURATION_USE_CASE, ConfigurationUseCase } from './use-cases/index.js'

export const CONFIGURATION_CONTROLLER = Symbol('ConfigurationController')

export class ConfigurationController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<ConfigurationController>(
      CONFIGURATION_CONTROLLER,
      (c) =>
        new ConfigurationController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<ConfigurationUseCase>(CONFIGURATION_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): ConfigurationController {
    return container.resolve<ConfigurationController>(CONFIGURATION_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter,
    protected readonly configurationUseCase: ConfigurationUseCase
  ) {
    super(validator, logger, 'configuration')

    validator.addSchemas(addSchemas)

    router.setHandler('all', '{*splat}', this.defaultHandler)
  }

  private readonly defaultHandler = async (
    request: HttpServerRequest
  ): Promise<HttpServerResponse | undefined> => {
    try {
      const data = {
        campaignId: request.headers['x-famir-campaign-id'],
        targetId: request.headers['x-famir-target-id']
      }

      validateConfigurationData(this.assertSchema, data)

      const { campaign, target } = await this.configurationUseCase.execute(data)

      request.locals.campaign = campaign
      request.locals.target = target

      return undefined
    } catch (error) {
      this.exceptionFilter(error, 'default', null)
    }
  }
}

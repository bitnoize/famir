import {
  HttpServerRequest,
  HttpServerResponse,
  HttpServerRouter,
  Logger,
  Validator
} from '@famir/domain'
import { ConfigurationUseCase } from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'
import { validateConfigurationData } from './configuration.utils.js'

export class ConfigurationController extends BaseController {
  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter,
    protected readonly configurationUseCase: ConfigurationUseCase
  ) {
    super(validator, logger, 'configuration')

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

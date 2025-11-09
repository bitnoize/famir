import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_REGISTRY,
  ReplServerApiCall,
  ReplServerRegistry,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { REDIRECTOR_SERVICE, RedirectorService } from '../../services/index.js'
import { BaseController } from '../base/index.js'
import {
  addSchemas,
  validateCreateRedirectorModel,
  validateDeleteRedirectorModel,
  validateListRedirectorModels,
  validateReadRedirectorModel,
  validateUpdateRedirectorModel
} from './redirector.utils.js'

export const REDIRECTOR_CONTROLLER = Symbol('RedirectorController')

export class RedirectorController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<RedirectorController>(
      REDIRECTOR_CONTROLLER,
      (c) =>
        new RedirectorController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRegistry>(REPL_SERVER_REGISTRY),
          c.resolve<RedirectorService>(REDIRECTOR_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): RedirectorController {
    return container.resolve<RedirectorController>(REDIRECTOR_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    registry: ReplServerRegistry,
    protected readonly redirectorService: RedirectorService
  ) {
    super(validator, logger, 'redirector')

    validator.addSchemas(addSchemas)

    registry.addApiCall('createRedirector', this.createRedirectorApiCall)
    registry.addApiCall('readRedirector', this.readRedirectorApiCall)
    registry.addApiCall('updateRedirector', this.updateRedirectorApiCall)
    registry.addApiCall('deleteRedirector', this.deleteRedirectorApiCall)
    registry.addApiCall('listRedirectors', this.listRedirectorsApiCall)

    this.logger.debug(`RedirectorController initialized`)
  }

  private readonly createRedirectorApiCall: ReplServerApiCall = async (data) => {
    try {
      validateCreateRedirectorModel(this.assertSchema, data)

      return await this.redirectorService.create(data)
    } catch (error) {
      this.handleException(error, 'createRedirector', data)
    }
  }

  private readonly readRedirectorApiCall: ReplServerApiCall = async (data) => {
    try {
      validateReadRedirectorModel(this.assertSchema, data)

      return await this.redirectorService.read(data)
    } catch (error) {
      this.handleException(error, 'readRedirector', data)
    }
  }

  private readonly updateRedirectorApiCall: ReplServerApiCall = async (data) => {
    try {
      validateUpdateRedirectorModel(this.assertSchema, data)

      return await this.redirectorService.update(data)
    } catch (error) {
      this.handleException(error, 'updateRedirector', data)
    }
  }

  private readonly deleteRedirectorApiCall: ReplServerApiCall = async (data) => {
    try {
      validateDeleteRedirectorModel(this.assertSchema, data)

      return await this.redirectorService.delete(data)
    } catch (error) {
      this.handleException(error, 'deleteRedirector', data)
    }
  }

  private readonly listRedirectorsApiCall: ReplServerApiCall = async (data) => {
    try {
      validateListRedirectorModels(this.assertSchema, data)

      return await this.redirectorService.list(data)
    } catch (error) {
      this.handleException(error, 'listRedirectors', data)
    }
  }
}

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
import { LURE_SERVICE, LureService } from '../../services/index.js'
import { BaseController } from '../base/index.js'
import {
  addSchemas,
  validateCreateLureModel,
  validateDeleteLureModel,
  validateListLureModels,
  validateReadLureModel,
  validateSwitchLureModel
} from './lure.utils.js'

export const LURE_CONTROLLER = Symbol('LureController')

export class LureController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<LureController>(
      LURE_CONTROLLER,
      (c) =>
        new LureController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRegistry>(REPL_SERVER_REGISTRY),
          c.resolve<LureService>(LURE_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): LureController {
    return container.resolve<LureController>(LURE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    registry: ReplServerRegistry,
    protected readonly lureService: LureService
  ) {
    super(validator, logger, 'lure')

    validator.addSchemas(addSchemas)

    registry.addApiCall('createLure', this.createLureApiCall)
    registry.addApiCall('readLure', this.readLureApiCall)
    registry.addApiCall('enableLure', this.enableLureApiCall)
    registry.addApiCall('disableLure', this.disableLureApiCall)
    registry.addApiCall('deleteLure', this.deleteLureApiCall)
    registry.addApiCall('listLures', this.listLuresApiCall)

    this.logger.debug(`LureController initialized`)
  }

  private readonly createLureApiCall: ReplServerApiCall = async (data) => {
    try {
      validateCreateLureModel(this.assertSchema, data)

      return await this.lureService.create(data)
    } catch (error) {
      this.handleException(error, 'createLure', data)
    }
  }

  private readonly readLureApiCall: ReplServerApiCall = async (data) => {
    try {
      validateReadLureModel(this.assertSchema, data)

      return await this.lureService.read(data)
    } catch (error) {
      this.handleException(error, 'readLure', data)
    }
  }

  private readonly enableLureApiCall: ReplServerApiCall = async (data) => {
    try {
      validateSwitchLureModel(this.assertSchema, data)

      return await this.lureService.enable(data)
    } catch (error) {
      this.handleException(error, 'enableLure', data)
    }
  }

  private readonly disableLureApiCall: ReplServerApiCall = async (data) => {
    try {
      validateSwitchLureModel(this.assertSchema, data)

      return await this.lureService.disable(data)
    } catch (error) {
      this.handleException(error, 'disableLure', data)
    }
  }

  private readonly deleteLureApiCall: ReplServerApiCall = async (data) => {
    try {
      validateDeleteLureModel(this.assertSchema, data)

      return await this.lureService.delete(data)
    } catch (error) {
      this.handleException(error, 'deleteLure', data)
    }
  }

  private readonly listLuresApiCall: ReplServerApiCall = async (data) => {
    try {
      validateListLureModels(this.assertSchema, data)

      return await this.lureService.list(data)
    } catch (error) {
      this.handleException(error, 'listLures', data)
    }
  }
}

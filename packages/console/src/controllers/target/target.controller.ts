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
import { TARGET_SERVICE, TargetService } from '../../services/index.js'
import { BaseController } from '../base/index.js'
import {
  addSchemas,
  validateCreateTargetModel,
  validateDeleteTargetModel,
  validateListTargetModels,
  validateReadTargetModel,
  validateSwitchTargetModel,
  validateUpdateTargetModel
} from './target.utils.js'

export const TARGET_CONTROLLER = Symbol('TargetController')

export class TargetController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<TargetController>(
      TARGET_CONTROLLER,
      (c) =>
        new TargetController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRegistry>(REPL_SERVER_REGISTRY),
          c.resolve<TargetService>(TARGET_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): TargetController {
    return container.resolve<TargetController>(TARGET_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    registry: ReplServerRegistry,
    protected readonly targetService: TargetService
  ) {
    super(validator, logger, 'target')

    validator.addSchemas(addSchemas)

    registry.addApiCall('createTarget', this.createTargetApiCall)
    registry.addApiCall('readTarget', this.readTargetApiCall)
    registry.addApiCall('updateTarget', this.updateTargetApiCall)
    registry.addApiCall('enableTarget', this.enableTargetApiCall)
    registry.addApiCall('disableTarget', this.disableTargetApiCall)
    registry.addApiCall('deleteTarget', this.deleteTargetApiCall)
    registry.addApiCall('listTargets', this.listTargetsApiCall)

    this.logger.debug(`TargetController initialized`)
  }

  private readonly createTargetApiCall: ReplServerApiCall = async (data) => {
    try {
      validateCreateTargetModel(this.assertSchema, data)

      return await this.targetService.create(data)
    } catch (error) {
      this.handleException(error, 'createTarget', data)
    }
  }

  private readonly readTargetApiCall: ReplServerApiCall = async (data) => {
    try {
      validateReadTargetModel(this.assertSchema, data)

      return await this.targetService.read(data)
    } catch (error) {
      this.handleException(error, 'readTarget', data)
    }
  }

  private readonly updateTargetApiCall: ReplServerApiCall = async (data) => {
    try {
      validateUpdateTargetModel(this.assertSchema, data)

      return await this.targetService.update(data)
    } catch (error) {
      this.handleException(error, 'updateTarget', data)
    }
  }

  private readonly enableTargetApiCall: ReplServerApiCall = async (data) => {
    try {
      validateSwitchTargetModel(this.assertSchema, data)

      return await this.targetService.enable(data)
    } catch (error) {
      this.handleException(error, 'enableTarget', data)
    }
  }

  private readonly disableTargetApiCall: ReplServerApiCall = async (data) => {
    try {
      validateSwitchTargetModel(this.assertSchema, data)

      return await this.targetService.disable(data)
    } catch (error) {
      this.handleException(error, 'disableTarget', data)
    }
  }

  private readonly deleteTargetApiCall: ReplServerApiCall = async (data) => {
    try {
      validateDeleteTargetModel(this.assertSchema, data)

      return await this.targetService.delete(data)
    } catch (error) {
      this.handleException(error, 'deleteTarget', data)
    }
  }

  private readonly listTargetsApiCall: ReplServerApiCall = async (data) => {
    try {
      validateListTargetModels(this.assertSchema, data)

      return await this.targetService.list(data)
    } catch (error) {
      this.handleException(error, 'listTargets', data)
    }
  }
}

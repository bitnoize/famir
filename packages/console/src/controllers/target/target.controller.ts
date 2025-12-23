import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerError,
  ReplServerRouter,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import {
  ActionTargetLabelData,
  CreateTargetData,
  DeleteTargetData,
  ListTargetsData,
  ReadTargetData,
  SwitchTargetData,
  UpdateTargetData
} from './target.js'
import {
  actionTargetLabelDataSchema,
  createTargetDataSchema,
  deleteTargetDataSchema,
  listTargetsDataSchema,
  readTargetDataSchema,
  switchTargetDataSchema,
  updateTargetDataSchema
} from './target.schemas.js'
import { TARGET_SERVICE, type TargetService } from './target.service.js'

export const TARGET_CONTROLLER = Symbol('TargetController')

export class TargetController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<TargetController>(
      TARGET_CONTROLLER,
      (c) =>
        new TargetController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
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
    router: ReplServerRouter,
    protected readonly targetService: TargetService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas({
      'console-create-target-data': createTargetDataSchema,
      'console-read-target-data': readTargetDataSchema,
      'console-update-target-data': updateTargetDataSchema,
      'console-switch-target-data': switchTargetDataSchema,
      'console-action-target-label-data': actionTargetLabelDataSchema,
      'console-delete-target-data': deleteTargetDataSchema,
      'console-list-targets-data': listTargetsDataSchema
    })

    this.router.addApiCall('createTarget', this.createTargetApiCall)
    this.router.addApiCall('readTarget', this.readTargetApiCall)
    this.router.addApiCall('updateTarget', this.updateTargetApiCall)
    this.router.addApiCall('enableTarget', this.enableTargetApiCall)
    this.router.addApiCall('disableTarget', this.disableTargetApiCall)
    this.router.addApiCall('appendTargetLabel', this.appendTargetLabelApiCall)
    this.router.addApiCall('removeTargetLabel', this.removeTargetLabelApiCall)
    this.router.addApiCall('deleteTarget', this.deleteTargetApiCall)
    this.router.addApiCall('listTargets', this.listTargetsApiCall)
  }

  private createTargetApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateCreateTargetData(data)

      return await this.targetService.createTarget(data)
    } catch (error) {
      this.handleException(error, 'createTarget', data)
    }
  }

  private readTargetApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateReadTargetData(data)

      return await this.targetService.readTarget(data)
    } catch (error) {
      this.handleException(error, 'readTarget', data)
    }
  }

  private updateTargetApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateUpdateTargetData(data)

      return await this.targetService.updateTarget(data)
    } catch (error) {
      this.handleException(error, 'updateTarget', data)
    }
  }

  private enableTargetApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateSwitchTargetData(data)

      return await this.targetService.enableTarget(data)
    } catch (error) {
      this.handleException(error, 'enableTarget', data)
    }
  }

  private disableTargetApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateSwitchTargetData(data)

      return await this.targetService.disableTarget(data)
    } catch (error) {
      this.handleException(error, 'disableTarget', data)
    }
  }

  private appendTargetLabelApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateActionTargetLabelData(data)

      return await this.targetService.appendTargetLabel(data)
    } catch (error) {
      this.handleException(error, 'appendTargetLabel', data)
    }
  }

  private removeTargetLabelApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateActionTargetLabelData(data)

      return await this.targetService.removeTargetLabel(data)
    } catch (error) {
      this.handleException(error, 'removeTargetLabel', data)
    }
  }

  private deleteTargetApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateDeleteTargetData(data)

      return await this.targetService.deleteTarget(data)
    } catch (error) {
      this.handleException(error, 'deleteTarget', data)
    }
  }

  private listTargetsApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateListTargetsData(data)

      return await this.targetService.listTargets(data)
    } catch (error) {
      this.handleException(error, 'listTargets', data)
    }
  }

  private validateCreateTargetData(value: unknown): asserts value is CreateTargetData {
    try {
      this.validator.assertSchema<CreateTargetData>('console-create-target-data', value)
    } catch (error) {
      throw new ReplServerError(`CreateTargetData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateReadTargetData(value: unknown): asserts value is ReadTargetData {
    try {
      this.validator.assertSchema<ReadTargetData>('console-read-target-data', value)
    } catch (error) {
      throw new ReplServerError(`ReadTargetData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateUpdateTargetData(value: unknown): asserts value is UpdateTargetData {
    try {
      this.validator.assertSchema<UpdateTargetData>('console-update-target-data', value)
    } catch (error) {
      throw new ReplServerError(`UpdateTargetData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateSwitchTargetData(value: unknown): asserts value is SwitchTargetData {
    try {
      this.validator.assertSchema<SwitchTargetData>('console-switch-target-data', value)
    } catch (error) {
      throw new ReplServerError(`SwitchTargetData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateActionTargetLabelData(value: unknown): asserts value is ActionTargetLabelData {
    try {
      this.validator.assertSchema<ActionTargetLabelData>('console-action-target-label-data', value)
    } catch (error) {
      throw new ReplServerError(`ActionTargetLabelData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateDeleteTargetData(value: unknown): asserts value is DeleteTargetData {
    try {
      this.validator.assertSchema<DeleteTargetData>('console-delete-target-data', value)
    } catch (error) {
      throw new ReplServerError(`DeleteTargetData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateListTargetsData(value: unknown): asserts value is ListTargetsData {
    try {
      this.validator.assertSchema<ListTargetsData>('console-list-targets-data', value)
    } catch (error) {
      throw new ReplServerError(`ListTargetsData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }
}

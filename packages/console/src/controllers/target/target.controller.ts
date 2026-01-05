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

    this.logger.debug(`TargetController initialized`)
  }

  private createTargetApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<CreateTargetData>('console-create-target-data', data)

    return await this.targetService.createTarget(data)
  }

  private readTargetApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<ReadTargetData>('console-read-target-data', data)

    return await this.targetService.readTarget(data)
  }

  private updateTargetApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<UpdateTargetData>('console-update-target-data', data)

    return await this.targetService.updateTarget(data)
  }

  private enableTargetApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<UpdateTargetData>('console-switch-target-data', data)

    return await this.targetService.enableTarget(data)
  }

  private disableTargetApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<UpdateTargetData>('console-switch-target-data', data)

    return await this.targetService.disableTarget(data)
  }

  private appendTargetLabelApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<ActionTargetLabelData>('console-action-target-label-data', data)

    return await this.targetService.appendTargetLabel(data)
  }

  private removeTargetLabelApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<ActionTargetLabelData>('console-action-target-label-data', data)

    return await this.targetService.removeTargetLabel(data)
  }

  private deleteTargetApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<DeleteTargetData>('console-delete-target-data', data)

    return await this.targetService.deleteTarget(data)
  }

  private listTargetsApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<ListTargetsData>('console-list-targets-data', data)

    return await this.targetService.listTargets(data)
  }
}

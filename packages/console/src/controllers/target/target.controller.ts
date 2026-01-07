import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
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
  UpdateTargetData
} from './target.js'
import { targetSchemas } from './target.schemas.js'
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

    this.validator.addSchemas(targetSchemas)

    this.router.register('createTarget', this.createTarget)
    this.router.register('readTarget', this.readTarget)
    this.router.register('updateTarget', this.updateTarget)
    this.router.register('enableTarget', this.enableTarget)
    this.router.register('disableTarget', this.disableTarget)
    this.router.register('appendTargetLabel', this.appendTargetLabel)
    this.router.register('removeTargetLabel', this.removeTargetLabel)
    this.router.register('deleteTarget', this.deleteTarget)
    this.router.register('listTargets', this.listTargets)

    this.logger.debug(`TargetController initialized`)
  }

  private createTarget: ReplServerApiCall = async (data) => {
    this.validateData<CreateTargetData>('console-create-target-data', data)

    return await this.targetService.createTarget(data)
  }

  private readTarget: ReplServerApiCall = async (data) => {
    this.validateData<ReadTargetData>('console-read-target-data', data)

    return await this.targetService.readTarget(data)
  }

  private updateTarget: ReplServerApiCall = async (data) => {
    this.validateData<UpdateTargetData>('console-update-target-data', data)

    return await this.targetService.updateTarget(data)
  }

  private enableTarget: ReplServerApiCall = async (data) => {
    this.validateData<UpdateTargetData>('console-switch-target-data', data)

    return await this.targetService.enableTarget(data)
  }

  private disableTarget: ReplServerApiCall = async (data) => {
    this.validateData<UpdateTargetData>('console-switch-target-data', data)

    return await this.targetService.disableTarget(data)
  }

  private appendTargetLabel: ReplServerApiCall = async (data) => {
    this.validateData<ActionTargetLabelData>('console-action-target-label-data', data)

    return await this.targetService.appendTargetLabel(data)
  }

  private removeTargetLabel: ReplServerApiCall = async (data) => {
    this.validateData<ActionTargetLabelData>('console-action-target-label-data', data)

    return await this.targetService.removeTargetLabel(data)
  }

  private deleteTarget: ReplServerApiCall = async (data) => {
    this.validateData<DeleteTargetData>('console-delete-target-data', data)

    return await this.targetService.deleteTarget(data)
  }

  private listTargets: ReplServerApiCall = async (data) => {
    this.validateData<ListTargetsData>('console-list-targets-data', data)

    return await this.targetService.listTargets(data)
  }
}

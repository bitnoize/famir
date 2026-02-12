import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerApiCall, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
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
    container.registerSingleton(
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
    return container.resolve(TARGET_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly targetService: TargetService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(targetSchemas)

    this.logger.debug(`TargetController initialized`)
  }

  register(): this {
    this.router
      .register('createTarget', this.createTargetApiCall)
      .register('readTarget', this.readTargetApiCall)
      .register('updateTarget', this.updateTargetApiCall)
      .register('enableTarget', this.enableTargetApiCall)
      .register('disableTarget', this.disableTargetApiCall)
      .register('appendTargetLabel', this.appendTargetLabelApiCall)
      .register('removeTargetLabel', this.removeTargetLabelApiCall)
      .register('deleteTarget', this.deleteTargetApiCall)
      .register('listTargets', this.listTargetsApiCall)

    return this
  }

  private createTargetApiCall: ReplServerApiCall = async (data) => {
    this.validateData<CreateTargetData>('console-create-target-data', data)

    await this.targetService.create(data)

    return true
  }

  private readTargetApiCall: ReplServerApiCall = async (data) => {
    this.validateData<ReadTargetData>('console-read-target-data', data)

    return await this.targetService.read(data)
  }

  private updateTargetApiCall: ReplServerApiCall = async (data) => {
    this.validateData<UpdateTargetData>('console-update-target-data', data)

    await this.targetService.update(data)

    return true
  }

  private enableTargetApiCall: ReplServerApiCall = async (data) => {
    this.validateData<UpdateTargetData>('console-switch-target-data', data)

    await this.targetService.enable(data)

    return true
  }

  private disableTargetApiCall: ReplServerApiCall = async (data) => {
    this.validateData<UpdateTargetData>('console-switch-target-data', data)

    await this.targetService.disable(data)

    return true
  }

  private appendTargetLabelApiCall: ReplServerApiCall = async (data) => {
    this.validateData<ActionTargetLabelData>('console-action-target-label-data', data)

    await this.targetService.appendLabel(data)

    return true
  }

  private removeTargetLabelApiCall: ReplServerApiCall = async (data) => {
    this.validateData<ActionTargetLabelData>('console-action-target-label-data', data)

    await this.targetService.removeLabel(data)

    return true
  }

  private deleteTargetApiCall: ReplServerApiCall = async (data) => {
    this.validateData<DeleteTargetData>('console-delete-target-data', data)

    await this.targetService.delete(data)

    return true
  }

  private listTargetsApiCall: ReplServerApiCall = async (data) => {
    this.validateData<ListTargetsData>('console-list-targets-data', data)

    return await this.targetService.list(data)
  }
}

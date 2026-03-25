import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  ActionTargetLabelData,
  CreateTargetData,
  DeleteTargetData,
  ListTargetsData,
  ReadTargetData,
  TARGET_SERVICE,
  UpdateTargetData,
  type TargetService
} from '../../services/index.js'
import { BaseController } from '../base/index.js'
import { TARGET_CONTROLLER } from './target.js'
import { targetSchemas } from './target.schemas.js'

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

  use() {
    this.router.addApiCall('createTarget', async (data) => {
      this.validateData<CreateTargetData>('console-create-target-data', data)

      return await this.targetService.create(data)
    })

    this.router.addApiCall('readTarget', async (data) => {
      this.validateData<ReadTargetData>('console-read-target-data', data)

      return await this.targetService.read(data)
    })

    this.router.addApiCall('updateTarget', async (data) => {
      this.validateData<UpdateTargetData>('console-update-target-data', data)

      return await this.targetService.update(data)
    })

    this.router.addApiCall('enableTarget', async (data) => {
      this.validateData<UpdateTargetData>('console-switch-target-data', data)

      return await this.targetService.enable(data)
    })

    this.router.addApiCall('disableTarget', async (data) => {
      this.validateData<UpdateTargetData>('console-switch-target-data', data)

      return await this.targetService.disable(data)
    })

    this.router.addApiCall('appendTargetLabel', async (data) => {
      this.validateData<ActionTargetLabelData>('console-action-target-label-data', data)

      return await this.targetService.appendLabel(data)
    })

    this.router.addApiCall('removeTargetLabel', async (data) => {
      this.validateData<ActionTargetLabelData>('console-action-target-label-data', data)

      return await this.targetService.removeLabel(data)
    })

    this.router.addApiCall('deleteTarget', async (data) => {
      this.validateData<DeleteTargetData>('console-delete-target-data', data)

      return await this.targetService.delete(data)
    })

    this.router.addApiCall('listTargets', async (data) => {
      this.validateData<ListTargetsData>('console-list-targets-data', data)

      return await this.targetService.list(data)
    })
  }
}

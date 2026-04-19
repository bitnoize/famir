import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  AlterTargetLabelData,
  CreateTargetData,
  DeleteTargetData,
  ListTargetsData,
  ReadTargetData,
  TARGET_CONTROLLER,
  TARGET_SERVICE,
  ToggleTargetData,
  UpdateTargetData,
} from './target.js'
import { targetSchemas } from './target.schemas.js'
import { type TargetService } from './target.service.js'

/**
 * Represents a target controller
 *
 * @category Target
 */
export class TargetController extends BaseController {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<TargetController>(
      TARGET_CONTROLLER,
      (c) =>
        new TargetController(
          c.resolve(VALIDATOR),
          c.resolve(LOGGER),
          c.resolve(REPL_SERVER_ROUTER),
          c.resolve(TARGET_SERVICE)
        )
    )
  }

  /**
   * Resolve dependency
   */
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
      this.validateData<ToggleTargetData>('console-toggle-target-data', data)

      return await this.targetService.enable(data)
    })

    this.router.addApiCall('disableTarget', async (data) => {
      this.validateData<ToggleTargetData>('console-toggle-target-data', data)

      return await this.targetService.disable(data)
    })

    this.router.addApiCall('appendTargetLabel', async (data) => {
      this.validateData<AlterTargetLabelData>('console-alter-target-label-data', data)

      return await this.targetService.appendLabel(data)
    })

    this.router.addApiCall('removeTargetLabel', async (data) => {
      this.validateData<AlterTargetLabelData>('console-alter-target-label-data', data)

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

import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  LURE_CONTROLLER,
  LURE_SERVICE,
  MakeLureUrlData,
  ReadLureData,
  ToggleLureData,
} from './lure.js'
import { lureSchemas } from './lure.schemas.js'
import { type LureService } from './lure.service.js'

/**
 * Represents a lure controller
 *
 * @category Lure
 */
export class LureController extends BaseController {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<LureController>(
      LURE_CONTROLLER,
      (c) =>
        new LureController(
          c.resolve(VALIDATOR),
          c.resolve(LOGGER),
          c.resolve(REPL_SERVER_ROUTER),
          c.resolve(LURE_SERVICE)
        )
    )
  }

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): LureController {
    return container.resolve(LURE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly lureService: LureService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(lureSchemas)

    this.logger.debug(`LureController initialized`)
  }

  use() {
    this.router.addApiCall('createLure', async (data) => {
      this.validateData<CreateLureData>('console-create-lure-data', data)

      return await this.lureService.create(data)
    })

    this.router.addApiCall('readLure', async (data) => {
      this.validateData<ReadLureData>('console-read-lure-data', data)

      return await this.lureService.read(data)
    })

    this.router.addApiCall('enableLure', async (data) => {
      this.validateData<ToggleLureData>('console-toggle-lure-data', data)

      return await this.lureService.enable(data)
    })

    this.router.addApiCall('disableLure', async (data) => {
      this.validateData<ToggleLureData>('console-toggle-lure-data', data)

      return await this.lureService.disable(data)
    })

    this.router.addApiCall('deleteLure', async (data) => {
      this.validateData<DeleteLureData>('console-delete-lure-data', data)

      return await this.lureService.delete(data)
    })

    this.router.addApiCall('listLures', async (data) => {
      this.validateData<ListLuresData>('console-list-lures-data', data)

      return await this.lureService.list(data)
    })

    this.router.addApiCall('makeLureUrl', async (data) => {
      this.validateData<MakeLureUrlData>('console-make-lure-url-data', data)

      return await this.lureService.makeUrl(data)
    })
  }
}

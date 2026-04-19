import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  LURE_SERVICE,
  MakeLureUrlData,
  ReadLureData,
  SwitchLureData,
  type LureService,
} from '../../services/index.js'
import { BaseController } from '../base/index.js'
import { LURE_CONTROLLER } from './lure.js'
import { lureSchemas } from './lure.schemas.js'

/*
 * Lure controller
 */
export class LureController extends BaseController {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton(
      LURE_CONTROLLER,
      (c) =>
        new LureController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<LureService>(LURE_SERVICE)
        )
    )
  }

  /*
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

  /*
   * Use api-calls
   */
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
      this.validateData<SwitchLureData>('console-switch-lure-data', data)

      return await this.lureService.enable(data)
    })

    this.router.addApiCall('disableLure', async (data) => {
      this.validateData<SwitchLureData>('console-switch-lure-data', data)

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

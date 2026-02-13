import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  ReadLureData,
  SwitchLureData
} from './lure.js'
import { lureSchemas } from './lure.schemas.js'
import { LURE_SERVICE, type LureService } from './lure.service.js'

export const LURE_CONTROLLER = Symbol('LureController')

export class LureController extends BaseController {
  static inject(container: DIContainer) {
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
    this.router.register('createLure', async (data) => {
      this.validateData<CreateLureData>('console-create-lure-data', data)

      return await this.lureService.create(data)
    })

    this.router.register('readLure', async (data) => {
      this.validateData<ReadLureData>('console-read-lure-data', data)

      return await this.lureService.read(data)
    })

    this.router.register('enableLure', async (data) => {
      this.validateData<SwitchLureData>('console-switch-lure-data', data)

      return await this.lureService.enable(data)
    })

    this.router.register('disableLure', async (data) => {
      this.validateData<SwitchLureData>('console-switch-lure-data', data)

      return await this.lureService.disable(data)
    })

    this.router.register('deleteLure', async (data) => {
      this.validateData<DeleteLureData>('console-delete-lure-data', data)

      return await this.lureService.delete(data)
    })

    this.router.register('listLures', async (data) => {
      this.validateData<ListLuresData>('console-list-lures-data', data)

      return await this.lureService.list(data)
    })
  }
}

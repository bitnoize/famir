import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  DumpPhishmapData,
  PHISHMAP_SERVICE,
  PrunePhishmapData,
  RestorePhishmapData,
  SavePhishmapData,
  LoadPhishmapData,
  type PhishmapService
} from '../../services/index.js'
import { BaseController } from '../base/index.js'
import { phishmapSchemas } from './phishmap.schemas.js'

export const PHISHMAP_CONTROLLER = Symbol('PhishmapController')

export class PhishmapController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      PHISHMAP_CONTROLLER,
      (c) =>
        new PhishmapController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<PhishmapService>(PHISHMAP_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): PhishmapController {
    return container.resolve(PHISHMAP_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly phishmapService: PhishmapService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(phishmapSchemas)

    this.logger.debug(`PhishmapController initialized`)
  }

  use(): this {
    this.router.register('dumpPhishmap', async (data) => {
      this.validateData<DumpPhishmapData>('console-dump-phishmap-data', data)

      return await this.phishmapService.dump(data)
    })

    this.router.register('restorePhishmap', async (data) => {
      this.validateData<RestorePhishmapData>('console-restore-phishmap-data', data)

      return await this.phishmapService.restore(data)
    })

    this.router.register('prunePhishmap', async (data) => {
      this.validateData<PrunePhishmapData>('console-prune-phishmap-data', data)

      return await this.phishmapService.prune(data)
    })

    this.router.register('loadPhishmap', async (data) => {
      this.validateData<LoadPhishmapData>('console-load-phishmap-data', data)

      return await this.phishmapService.load(data)
    })

    this.router.register('savePhishmap', async (data) => {
      this.validateData<SavePhishmapData>('console-save-phishmap-data', data)

      return await this.phishmapService.save(data)
    })

    return this
  }
}

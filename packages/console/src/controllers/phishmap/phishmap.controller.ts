import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  DumpPhishmapData,
  PHISHMAP_SERVICE,
  PrunePhishmapData,
  RestorePhishmapData,
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

  use() {
    this.router.addApiCall('dumpPhishmap', async (data) => {
      this.validateData<DumpPhishmapData>('console-dump-phishmap-data', data)

      return await this.phishmapService.dump(data)
    })

    this.router.addApiCall('restorePhishmap', async (data) => {
      this.validateData<RestorePhishmapData>('console-restore-phishmap-data', data)

      return await this.phishmapService.restore(data)
    })

    this.router.addApiCall('prunePhishmap', async (data) => {
      this.validateData<PrunePhishmapData>('console-prune-phishmap-data', data)

      return await this.phishmapService.prune(data)
    })
  }
}

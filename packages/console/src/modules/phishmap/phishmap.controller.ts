import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  DumpPhishmapData,
  PHISHMAP_CONTROLLER,
  PHISHMAP_SERVICE,
  PurgePhishmapData,
  RestorePhishmapData,
} from './phishmap.js'
import { phishmapSchemas } from './phishmap.schemas.js'
import { type PhishmapService } from './phishmap.service.js'

/*
 * Phishmap controller
 */
export class PhishmapController extends BaseController {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
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

  /*
   * Resolve dependency
   */
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

  /*
   * Use api-calls
   */
  use() {
    this.router.addApiCall('dumpPhishmap', async (data) => {
      this.validateData<DumpPhishmapData>('console-dump-phishmap-data', data)

      return await this.phishmapService.dump(data)
    })

    this.router.addApiCall('restorePhishmap', async (data) => {
      this.validateData<RestorePhishmapData>('console-restore-phishmap-data', data)

      return await this.phishmapService.restore(data)
    })

    this.router.addApiCall('purgePhishmap', async (data) => {
      this.validateData<PurgePhishmapData>('console-purge-phishmap-data', data)

      return await this.phishmapService.purge(data)
    })
  }
}

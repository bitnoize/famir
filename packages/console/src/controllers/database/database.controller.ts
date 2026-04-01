import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { DATABASE_SERVICE, type DatabaseService } from '../../services/index.js'
import { BaseController } from '../base/index.js'
import { DATABASE_CONTROLLER } from './database.js'

/*
 * Database controller
 */
export class DatabaseController extends BaseController {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton(
      DATABASE_CONTROLLER,
      (c) =>
        new DatabaseController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<DatabaseService>(DATABASE_SERVICE)
        )
    )
  }

  /*
   * Resolve dependency
   */
  static resolve(container: DIContainer): DatabaseController {
    return container.resolve(DATABASE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly databaseService: DatabaseService
  ) {
    super(validator, logger, router)

    this.logger.debug(`DatabaseController initialized`)
  }

  /*
   * Use api-calls
   */
  use() {
    this.router.addApiCall('loadDatabaseFunctions', async () => {
      return await this.databaseService.loadDatabaseFunctions()
    })

    this.router.addApiCall('cleanupDatabase', async () => {
      return await this.databaseService.cleanupDatabase()
    })
  }
}

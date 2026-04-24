import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { DATABASE_CONTROLLER, DATABASE_SERVICE } from './database.js'
import { type DatabaseService } from './database.service.js'

/**
 * Represents a database controller
 *
 * @category Database
 */
export class DatabaseController extends BaseController {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<DatabaseController>(
      DATABASE_CONTROLLER,
      (c) =>
        new DatabaseController(
          c.resolve(VALIDATOR),
          c.resolve(LOGGER),
          c.resolve(REPL_SERVER_ROUTER),
          c.resolve(DATABASE_SERVICE)
        )
    )
  }

  /**
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

  use() {
    this.router.addApiCall('loadDatabaseFunctions', async () => {
      return await this.databaseService.loadDatabaseFunctions()
    })

    this.router.addApiCall('cleanupDatabase', async () => {
      return await this.databaseService.cleanupDatabase()
    })
  }
}

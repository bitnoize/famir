import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { DATABASE_SERVICE, type DatabaseService } from '../../services/index.js'
import { BaseController } from '../base/index.js'

export const DATABASE_CONTROLLER = Symbol('DatabaseController')

export class DatabaseController extends BaseController {
  static inject(container: DIContainer) {
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

  use(): this {
    this.router.register('loadDatabaseFunctions', async () => {
      return await this.databaseService.loadFunctions()
    })

    this.router.register('cleanupDatabase', async () => {
      return await this.databaseService.cleanup()
    })

    return this
  }
}

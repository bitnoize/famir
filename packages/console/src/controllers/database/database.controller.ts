import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerApiCall, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { DATABASE_SERVICE, type DatabaseService } from './database.service.js'

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

  register(): this {
    this.router
      .register('loadDatabaseFunctions', this.loadDatabaseFunctionsApiCall)
      .register('cleanupDatabase', this.cleanupDatabaseApiCall)

    return this
  }

  private loadDatabaseFunctionsApiCall: ReplServerApiCall = async () => {
    await this.databaseService.loadFunctions()

    return true
  }

  private cleanupDatabaseApiCall: ReplServerApiCall = async () => {
    await this.databaseService.cleanup()

    return true
  }
}

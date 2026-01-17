import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerRouter,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { DATABASE_SERVICE, type DatabaseService } from './database.service.js'

export const DATABASE_CONTROLLER = Symbol('DatabaseController')

export class DatabaseController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<DatabaseController>(
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
    return container.resolve<DatabaseController>(DATABASE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly databaseService: DatabaseService
  ) {
    super(validator, logger, router)

    this.router.register('loadDatabaseFunctions', this.loadDatabaseFunctions)
    this.router.register('cleanupDatabase', this.cleanupDatabase)

    this.logger.debug(`DatabaseController initialized`)
  }

  private loadDatabaseFunctions: ReplServerApiCall = async () => {
    await this.databaseService.loadFunctions()
  }

  private cleanupDatabase: ReplServerApiCall = async () => {
    await this.databaseService.cleanup()
  }
}

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

    this.router.addApiCall('loadDatabaseFunctions', this.loadDatabaseFunctionsApiCall)
    this.router.addApiCall('cleanupDatabase', this.cleanupDatabaseApiCall)
  }

  private loadDatabaseFunctionsApiCall: ReplServerApiCall = async () => {
    try {
      await this.databaseService.loadDatabaseFunctions()
    } catch (error) {
      this.handleException(error, 'loadDatabaseFunctions', null)
    }
  }

  private cleanupDatabaseApiCall: ReplServerApiCall = async () => {
    try {
      await this.databaseService.cleanupDatabase()
    } catch (error) {
      this.handleException(error, 'cleanupDatabase', null)
    }
  }
}

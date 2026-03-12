import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { ActionDatabaseData, DATABASE_SERVICE, type DatabaseService } from '../../services/index.js'
import { BaseController } from '../base/index.js'
import { databaseSchemas } from './database.schemas.js'

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

    this.validator.addSchemas(databaseSchemas)

    this.logger.debug(`DatabaseController initialized`)
  }

  use(): this {
    this.router.register('loadDatabaseFunctions', async (data) => {
      this.validateData<ActionDatabaseData>('console-action-database-data', data)

      return await this.databaseService.loadDatabaseFunctions(data)
    })

    this.router.register('cleanupDatabase', async (data) => {
      this.validateData<ActionDatabaseData>('console-action-database-data', data)

      return await this.databaseService.cleanupDatabase(data)
    })

    return this
  }
}

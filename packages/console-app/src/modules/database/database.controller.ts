import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { CleanupDatabaseArgs, LoadDatabaseFunctionsArgs } from './database.js'
import { cleanupDatabaseArgsSchema, loadDatabaseFunctionsArgsSchema } from './database.schemas.js'
import { type DatabaseService, DATABASE_SERVICE } from './database.service.js'

/**
 * DI token for the database controller.
 *
 * @category Database
 */
export const DATABASE_CONTROLLER = Symbol('DatabaseController')

/**
 * Represents the database controller.
 *
 * @category Database
 */
export class DatabaseController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
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

  /**
   * Resolves the controller from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The controller instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<DatabaseController>(DATABASE_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param router - The repl-server router instance.
   * @param databaseService - The database service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly databaseService: DatabaseService
  ) {
    super(validator, logger, router)

    this.validator
      .addSchema('console-load-database-functions-args', loadDatabaseFunctionsArgsSchema)
      .addSchema('console-cleanup-database-args', cleanupDatabaseArgsSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<LoadDatabaseFunctionsArgs>(
      {
        name: 'database-load-functions',
        description: `Loads all custom functions into the database.`,
        schemaName: 'console-load-database-functions-args',
        options: [
          {
            name: 'force',
            description: `The confirmation flag.`,
            type: 'boolean',
            default: false,
          },
        ],
      },
      (console, spec) => {
        console.log(`// Loads database functions:\n` + `.${spec.name} --force\n`)
      },
      async (console, spec, args) => {
        if (args.force) {
          await this.databaseService.loadDatabaseFunctions()

          console.log(`Database Functions loaded!`)
        } else {
          this.confirmAlert(console)
        }
      }
    )

    this.router.addCommand<CleanupDatabaseArgs>(
      {
        name: 'database-cleanup',
        description: 'Cleans up the entire database.',
        schemaName: 'console-cleanup-database-args',
        options: [
          {
            name: 'force',
            description: `The confirmation flag.`,
            type: 'boolean',
            default: false,
          },
        ],
      },
      (console, spec) => {
        console.log(`// Cleans up database with confirmation:\n` + `.${spec.name} --force\n`)
      },
      async (console, spec, args) => {
        if (args.force) {
          await this.databaseService.cleanupDatabase()

          console.log(`Database cleaned up!`)
        } else {
          this.confirmAlert(console)
        }
      }
    )
  }
}

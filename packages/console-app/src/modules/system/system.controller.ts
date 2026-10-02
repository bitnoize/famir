import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  ReplServerError,
  TEMPLATER,
  Templater,
  Validator,
  VALIDATOR,
} from '@famir/domain'
import {
  REPL_SERVER_ASSETS,
  REPL_SERVER_ROUTER,
  type ReplServerAssets,
  type ReplServerRouter,
} from '@famir/repl-server'
import { BaseController } from '../base/index.js'
import {
  CleanupDatabaseArgs,
  GetDatabaseInfoArgs,
  GetProducerInfoArgs,
  LoadDatabaseFunctionsArgs,
  SystemAssetsArgs,
  SystemHelpArgs,
} from './system.js'
import {
  cleanupDatabaseArgsSchema,
  getDatabaseInfoArgsSchema,
  getProducerInfoArgsSchema,
  loadDatabaseFunctionsArgsSchema,
  systemAssetsArgsSchema,
  systemHelpArgsSchema,
} from './system.schemas.js'
import { SYSTEM_SERVICE, type SystemService } from './system.service.js'

/**
 * DI token for the system controller.
 *
 * @category System
 */
export const SYSTEM_CONTROLLER = Symbol('SystemController')

/**
 * Represents the system controller.
 *
 * @category System
 */
export class SystemController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<SystemController>(
      SYSTEM_CONTROLLER,
      (c) =>
        new SystemController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<ReplServerAssets>(REPL_SERVER_ASSETS),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<SystemService>(SYSTEM_SERVICE)
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
    return container.resolve<SystemController>(SYSTEM_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   * @param systemService - The system service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    assets: ReplServerAssets,
    router: ReplServerRouter,
    protected readonly systemService: SystemService
  ) {
    super(validator, logger, templater, assets, router)

    this.validator
      .addSchema('console-system-help-args', systemHelpArgsSchema)
      .addSchema('console-system-assets-args', systemAssetsArgsSchema)
      .addSchema('console-get-database-info-args', getDatabaseInfoArgsSchema)
      .addSchema('console-load-database-functions-args', loadDatabaseFunctionsArgsSchema)
      .addSchema('console-cleanup-database-args', cleanupDatabaseArgsSchema)
      .addSchema('console-get-producer-info-args', getProducerInfoArgsSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<SystemHelpArgs>(
      {
        name: 'help',
        description: `Show help screen with list of all commands.`,
        schemaName: 'console-system-help-args',
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      async (console) => {
        console.log(`Fake Mirrors Console`)

        console.table(this.router.getCommandsOverview())
      }
    )

    this.router.addCommand<SystemAssetsArgs>(
      {
        name: 'assets',
        description: `Show assets list or specified asset content.`,
        schemaName: 'console-system-assets-args',
        options: [
          {
            name: 'asset-name',
            description: `The name of the asset to show.`,
            type: 'string',
            alias: 'a',
            default: '',
          },
        ],
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      async (console, spec, args) => {
        if (args.assetName) {
          const asset = this.assets.get(args.assetName)

          if (!asset) {
            throw ReplServerError.badRequest(`Asset not found`)
          }

          console.log(asset)
        } else {
          console.table(Array.from(this.assets.keys()))
        }
      }
    )

    this.router.addCommand<GetDatabaseInfoArgs>(
      {
        name: 'database-info',
        description: 'Get database information.',
        schemaName: 'console-get-database-info-args',
        options: [],
      },
      async (console) => {
        const info = await this.systemService.getDatabaseInfo()

        console.log(info)
      }
    )

    this.router.addCommand<LoadDatabaseFunctionsArgs>(
      {
        name: 'database-functions',
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
      async (console, spec, args) => {
        if (args.force) {
          await this.systemService.loadDatabaseFunctions()

          console.log(`Database Functions loaded!`)
        } else {
          this.confirmAlert(console)
        }
      }
    )

    this.router.addCommand<CleanupDatabaseArgs>(
      {
        name: 'database-cleanup',
        description: `Cleanup entire the database.`,
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
      async (console, spec, args) => {
        if (args.force) {
          await this.systemService.cleanupDatabase()

          console.log(`Database cleaned up!`)
        } else {
          this.confirmAlert(console)
        }
      }
    )

    this.router.addCommand<GetProducerInfoArgs>(
      {
        name: 'producer-info',
        description: `Show producer information.`,
        schemaName: 'console-get-producer-info-args',
        options: [],
      },
      async (console) => {
        const info = await this.systemService.getProducerInfo()

        console.log(info)
      }
    )
  }
}

import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import {
  REPL_SERVER_ASSETS,
  REPL_SERVER_ROUTER,
  ReplServerAssets,
  ReplServerError,
  ReplServerRouter,
} from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  AssetsArgs,
  GetDatabaseInfoArgs,
  GetEdgeServerInfoArgs,
  GetProducerInfoArgs,
  LoadDatabaseFunctionsArgs,
} from './system.js'
import {
  assetsArgsSchema,
  getDatabaseInfoArgsSchema,
  getEdgeServerInfoArgsSchema,
  getProducerInfoArgsSchema,
  loadDatabaseFunctionsArgsSchema,
} from './system.schemas.js'
import { type SystemService, SYSTEM_SERVICE } from './system.service.js'

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
   * @param assets - The repl-server assets instance.
   * @param router - The repl-server router instance.
   * @param systemService - The system service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    assets: ReplServerAssets,
    router: ReplServerRouter,
    protected readonly systemService: SystemService
  ) {
    super(validator, logger, assets, router)

    this.validator
      .addSchema('console-assets-args', assetsArgsSchema)
      .addSchema('console-get-database-info-args', getDatabaseInfoArgsSchema)
      .addSchema('console-load-database-functions-args', loadDatabaseFunctionsArgsSchema)
      .addSchema('console-get-producer-info-args', getProducerInfoArgsSchema)
      .addSchema('console-get-edge-server-info-args', getEdgeServerInfoArgsSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<AssetsArgs>(
      {
        name: 'assets',
        description: `Show assets list or specified asset content.`,
        schemaName: 'console-assets-args',
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
      (console, spec) => {
        console.log(`// Show assets list:`)
        console.log(`.${spec.name}`)

        console.log(`// Show specific asset content:`)
        console.log(`.${spec.name} -a hello.txt`)
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
          console.log(Array.from(this.assets.keys()))
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
      (console, spec) => {},
      async (console, spec, args) => {
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
      (console, spec) => {},
      async (console, spec, args) => {
        if (args.force) {
          await this.systemService.loadDatabaseFunctions()

          console.log(`Database Functions loaded!`)
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
      (console, spec) => {},
      async (console, spec, args) => {
        const info = await this.systemService.getProducerInfo()

        console.log(info)
      }
    )

    this.router.addCommand<GetEdgeServerInfoArgs>(
      {
        name: 'edge-server-info',
        description: `Show edge-server information.`,
        schemaName: 'console-get-edge-server-info-args',
        options: [],
      },
      (console, spec) => {},
      async (console, spec, args) => {
        const info = await this.systemService.getEdgeServerInfo()

        console.log(info)
      }
    )
  }
}

import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import {
  REPL_SERVER_ASSETS,
  REPL_SERVER_ROUTER,
  ReplServerAssets,
  ReplServerError,
  ReplServerRouter,
} from '@famir/repl-server'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  AssetsArgs,
  CleanupDatabaseArgs,
  DeleteEdgeServerConfigArgs,
  GetDatabaseInfoArgs,
  GetProducerInfoArgs,
  LoadDatabaseFunctionsArgs,
  ReadEdgeServerConfigArgs,
  ReadEdgeServerUpstreamsArgs,
  UpsertEdgeServerConfigArgs,
} from './system.js'
import {
  assetsArgsSchema,
  cleanupDatabaseArgsSchema,
  deleteEdgeServerConfigArgsSchema,
  getDatabaseInfoArgsSchema,
  getProducerInfoArgsSchema,
  loadDatabaseFunctionsArgsSchema,
  readEdgeServerConfigArgsSchema,
  readEdgeServerUpstreamsArgsSchema,
  upsertEdgeServerConfigArgsSchema,
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
      .addSchema('console-assets-args', assetsArgsSchema)
      .addSchema('console-get-database-info-args', getDatabaseInfoArgsSchema)
      .addSchema('console-load-database-functions-args', loadDatabaseFunctionsArgsSchema)
      .addSchema('console-cleanup-database-args', cleanupDatabaseArgsSchema)
      .addSchema('console-get-producer-info-args', getProducerInfoArgsSchema)
      .addSchema('console-upsert-edge-server-config-args', upsertEdgeServerConfigArgsSchema)
      .addSchema('console-read-edge-server-config-args', readEdgeServerConfigArgsSchema)
      .addSchema('console-delete-edge-server-config-args', deleteEdgeServerConfigArgsSchema)
      .addSchema('console-read-edge-server-upstreams-args', readEdgeServerUpstreamsArgsSchema)
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
      (console, spec) => {
        console.log(`// Show database info:`)
        console.log(`.${spec.name}`)
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
      (console, spec) => {
        console.log(`// Load database functions:`)
        console.log(`.${spec.name} --force`)
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
      (console, spec) => {
        console.log(`// Cleanup database:`)
        console.log(`.${spec.name} --force`)
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
      (console, spec) => {
        console.log(`// Show producer info:`)
        console.log(`.${spec.name}`)
      },
      async (console) => {
        const info = await this.systemService.getProducerInfo()

        console.log(info)
      }
    )

    this.router.addCommand<UpsertEdgeServerConfigArgs>(
      {
        name: 'edge-server-upsert-config',
        description: `Upsert edge-server configuration.`,
        schemaName: 'console-upsert-edge-server-config-args',
        options: [
          {
            name: 'asset-name',
            description: `The name of the asset contains config.`,
            type: 'string',
            alias: 'a',
            default: '',
          },
          {
            name: 'force',
            description: `The confirmation flag.`,
            type: 'boolean',
            default: false,
          },
        ],
      },
      (console, spec) => {
        console.log(`// Upsert edge-server config:`)
        console.log(`.${spec.name} -a Caddyfile-local --force`)
      },
      async (console, spec, args) => {
        if (args.force) {
          const config = this.parseEdgeServerConfig(args.assetName)

          await this.systemService.upsertEdgeServerConfig(config)
          console.log(`Edge server config upserted!`)
        } else {
          this.confirmAlert(console)
        }
      }
    )

    this.router.addCommand<ReadEdgeServerConfigArgs>(
      {
        name: 'edge-server-read-config',
        description: `Read edge-server configuration.`,
        schemaName: 'console-read-edge-server-config-args',
        options: [],
      },
      (console, spec) => {
        console.log(`// Read edge-server config:`)
        console.log(`.${spec.name}`)
      },
      async (console) => {
        const config = await this.systemService.readEdgeServerConfig()

        console.log(config)
      }
    )

    this.router.addCommand<DeleteEdgeServerConfigArgs>(
      {
        name: 'edge-server-delete-config',
        description: `Delete edge-server configuration.`,
        schemaName: 'console-delete-edge-server-config-args',
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
        console.log(`// Delete edge-server config:`)
        console.log(`.${spec.name} --force`)
      },
      async (console, spec, args) => {
        if (args.force) {
          await this.systemService.deleteEdgeServerConfig()

          console.log(`Edge server config deleted!`)
        } else {
          this.confirmAlert(console)
        }
      }
    )

    this.router.addCommand<ReadEdgeServerUpstreamsArgs>(
      {
        name: 'edge-server-read-upstreams',
        description: `Read edge-server upstreams.`,
        schemaName: 'console-read-edge-server-upstreams-args',
        options: [],
      },
      (console, spec) => {
        console.log(`// Read edge-server upstreams:`)
        console.log(`.${spec.name}`)
      },
      async (console) => {
        const config = await this.systemService.readEdgeServerUpstreams()

        console.log(config)
      }
    )
  }

  private parseEdgeServerConfig(assetName: string): string {
    const asset = this.assets.get(assetName)

    if (!asset) {
      throw ReplServerError.badRequest(`Config  asset not found`)
    }

    return asset
  }
}

import { DIContainer } from '@famir/common'
import { LureModel, RedirectorParams, redirectorParamsSchema } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import {
  REPL_SERVER_ASSETS,
  REPL_SERVER_ROUTER,
  ReplServerAssets,
  ReplServerRouter,
} from '@famir/repl-server'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  CreateLureArgs,
  DeleteLureArgs,
  ListLuresArgs,
  MakeLureUrlArgs,
  ReadLureArgs,
  ToggleLureArgs,
} from './lure.js'
import {
  createLureArgsSchema,
  deleteLureArgsSchema,
  listLuresArgsSchema,
  makeLureUrlArgsSchema,
  readLureArgsSchema,
  toggleLureArgsSchema,
} from './lure.schemas.js'
import { type LureService, LURE_SERVICE } from './lure.service.js'

/**
 * DI token for the lure controller.
 *
 * @category Lure
 */
export const LURE_CONTROLLER = Symbol('LureController')

/**
 * Represents the lure controller.
 *
 * @category Lure
 */
export class LureController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<LureController>(
      LURE_CONTROLLER,
      (c) =>
        new LureController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<ReplServerAssets>(REPL_SERVER_ASSETS),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<LureService>(LURE_SERVICE)
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
    return container.resolve<LureController>(LURE_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   * @param lureService - The lure service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    assets: ReplServerAssets,
    router: ReplServerRouter,
    protected readonly lureService: LureService
  ) {
    super(validator, logger, templater, assets, router)

    this.validator
      .addSchema('console-create-lure-args', createLureArgsSchema)
      .addSchema('console-read-lure-args', readLureArgsSchema)
      .addSchema('console-toggle-lure-args', toggleLureArgsSchema)
      .addSchema('console-delete-lure-args', deleteLureArgsSchema)
      .addSchema('console-list-lures-args', listLuresArgsSchema)
      .addSchema('console-make-lure-url-args', makeLureUrlArgsSchema)
      .addSchema('console-lure-params', redirectorParamsSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<CreateLureArgs>(
      {
        name: 'lure-create',
        description: `Creates a new lure.`,
        schemaName: 'console-create-lure-args',
        options: [
          {
            name: 'path',
            description: `The URL path for the lure.`,
            type: 'string',
          },
        ],
        params: ['campaign-id', 'lure-id', 'redirector-id'],
      },
      (console, spec) => {
        console.log(
          `The lure will be created in a disabled state (isEnabled = false).\n` +
            `Use '.lure-enable' command to activate it for traffic routing.\n`
        )

        console.log(
          `// Creates a 'test' lure in the 'hackernews' campaign with 'simple' redirector:`
        )
        console.log(`.${spec.name} hackernews test simple --path /some/secret/test.html\n`)
      },
      async (console, spec, args) => {
        const [campaignId, lureId, redirectorId] = args._

        await this.lureService.create({
          campaignId,
          lureId,
          path: args.path,
          redirectorId,
        })

        console.log(`Lure created!`)
      }
    )

    this.router.addCommand<ReadLureArgs>(
      {
        name: 'lure-read',
        description: `Reads the lure by its ID.`,
        schemaName: 'console-read-lure-args',
        options: [],
        params: ['campaign-id', 'lure-id'],
      },
      (console, spec) => {
        console.log(`// Reads the 'test' lure in the 'hackernews' campaign:`)
        console.log(`.${spec.name} hackernews test\n`)
      },
      async (console, spec, args) => {
        const [campaignId, lureId] = args._

        const lure = await this.lureService.read({
          campaignId,
          lureId,
        })

        this.showLureModel(console, lure)
      }
    )

    this.router.addCommand<ToggleLureArgs>(
      {
        name: 'lure-enable',
        description: `Enables the lure, making it available for request routing.`,
        schemaName: 'console-toggle-lure-args',
        options: [],
        params: ['campaign-id', 'lure-id'],
      },
      (console, spec) => {
        console.log(
          `When enabled, the URL path becomes active and can be used to serve ` +
            `the associated redirector content.\n`
        )

        console.log(`// Enables the 'test' lure in the 'hackernews' campaign:`)
        console.log(`.${spec.name} hackernews test\n`)
      },
      async (console, spec, args) => {
        const [campaignId, lureId] = args._

        await this.lureService.enable({
          campaignId,
          lureId,
        })

        console.log(`Lure enabled!`)
      }
    )

    this.router.addCommand<ToggleLureArgs>(
      {
        name: 'lure-disable',
        description: `Disables the lure, stopping request routing.`,
        schemaName: 'console-toggle-lure-args',
        options: [],
        params: ['campaign-id', 'lure-id'],
      },
      (console, spec) => {
        console.log(`When disabled, requests to the URL path will not be routed.\n`)

        console.log(`// Disables the 'test' lure in the 'hackernews' campaign:`)
        console.log(`.${spec.name} hackernews test\n`)
      },
      async (console, spec, args) => {
        const [campaignId, lureId] = args._

        await this.lureService.disable({
          campaignId,
          lureId,
        })

        console.log(`Lure disabled!`)
      }
    )

    this.router.addCommand<DeleteLureArgs>(
      {
        name: 'lure-delete',
        description: `Deletes the lure by its ID.`,
        schemaName: 'console-delete-lure-args',
        options: [],
        params: ['campaign-id', 'lure-id', 'redirector-id'],
      },
      (console, spec) => {
        console.log(`A lure must be disabled before it can be deleted.\n`)

        console.log(`// Deletes the 'test' lure in the 'hackernews' campaign:`)
        console.log(`.${spec.name} hackernews test\n`)
      },
      async (console, spec, args) => {
        const [campaignId, lureId, redirectorId] = args._

        await this.lureService.delete({
          campaignId,
          lureId,
          redirectorId,
        })

        console.log(`Lure deleted!`)
      }
    )

    this.router.addCommand<ListLuresArgs>(
      {
        name: 'lure-list',
        description: `Lists all lures for the campaign.`,
        schemaName: 'console-list-lures-args',
        options: [],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`The lures are ordered by creation time (oldest first).\n`)

        console.log(`// Lists all lures in the 'hackernews' campaign:`)
        console.log(`.${spec.name} hackernews\n`)
      },
      async (console, spec, args) => {
        const [campaignId] = args._

        const lures = await this.lureService.list({
          campaignId,
        })

        this.showLureCollection(console, lures)
      }
    )

    this.router.addCommand<MakeLureUrlArgs>(
      {
        name: 'lure-make-url',
        description: `Makes the lure URL with redirector params.`,
        schemaName: 'console-make-lure-url-args',
        options: [
          {
            name: 'params',
            description: `The redirector params to use as JSON string.`,
            type: 'string',
            alias: 'p',
          },
        ],
        params: ['campaign-id', 'lure-id', 'target-id'],
      },
      (console, spec) => {
        console.log(
          `// Makes a URL for the 'test' lure in the 'hackernews' campaign via 'root' target:`
        )
        console.log(
          `.${spec.name} hackernews test root -p '{"og_title":"Boom!", "og_description":"BOOM!"}'`
        )
      },
      async (console, spec, args) => {
        const [campaignId, lureId, targetId] = args._

        const params = this.parseParams(args.params)

        const url = await this.lureService.makeUrl({
          campaignId,
          lureId,
          targetId,
          params,
        })

        console.log(url)
      }
    )
  }

  private parseParams(json: string): RedirectorParams {
    const params = this.decodeJson(json)

    this.validateData<RedirectorParams>('console-lure-params', params)

    return params
  }

  private showLureModel(console: Console, lure: LureModel) {
    console.table({
      campaignId: lure.campaignId,
      lureId: lure.lureId,
      path: lure.path,
      redirectorId: lure.redirectorId,
      isEnabled: lure.isEnabled,
      sessionCount: lure.sessionCount,
      createdAt: lure.createdAt.toISOString(),
    })
  }

  private showLureCollection(console: Console, lures: LureModel[]) {
    console.table(
      lures.map((lure) => {
        return {
          campaignId: lure.campaignId,
          lureId: lure.lureId,
          path: lure.path,
          redirectorId: lure.redirectorId,
          isEnabled: lure.isEnabled,
          sessionCount: lure.sessionCount,
          createdAt: lure.createdAt.toISOString(),
        }
      })
    )
  }
}

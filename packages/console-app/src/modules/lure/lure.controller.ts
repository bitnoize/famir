import { DIContainer } from '@famir/common'
import { LureModel, RedirectorParams } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
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
   * @param router - The repl-server router instance.
   * @param lureService - The lure service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly lureService: LureService
  ) {
    super(validator, logger, router)

    this.validator
      .addSchema('console-create-lure-args', createLureArgsSchema)
      .addSchema('console-read-lure-args', readLureArgsSchema)
      .addSchema('console-toggle-lure-args', toggleLureArgsSchema)
      .addSchema('console-delete-lure-args', deleteLureArgsSchema)
      .addSchema('console-list-lures-args', listLuresArgsSchema)
      .addSchema('console-make-lure-url-args', makeLureUrlArgsSchema)
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
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'lure-id', 'redirector-id'],
      },
      (console, spec) => {
        console.log(`Returns the lure model.\n`)

        console.log(
          `The lure will be created in a disabled state (isEnabled = false).\n` +
            `Use '.lure-enable' command to activate it for traffic routing.\n`
        )

        console.log(
          `// Creates a 'test' lure in 'hackernews' campaign with 'simple' redirector:\n` +
            `.${spec.name} hackernews test simple --path /some/secret/test.html -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        const lure = await this.lureService.create({
          campaignId: args._[0],
          lureId: args._[1],
          path: args.path,
          redirectorId: args._[2],
          lockSecret: args.lockSecret,
        })

        this.showLureModel(console, lure)
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
        console.log(`Returns the lure model.\n`)

        console.log(
          `// Reads the 'test' lure in 'hackernews' campaign:\n` + `.${spec.name} hackernews test\n`
        )
      },
      async (console, spec, args) => {
        const lure = await this.lureService.read({
          campaignId: args._[0],
          lureId: args._[1],
        })

        this.showLureModel(console, lure)
      }
    )

    this.router.addCommand<ToggleLureArgs>(
      {
        name: 'lure-enable',
        description: `Enables the lure, making it available for request routing.`,
        schemaName: 'console-toggle-lure-args',
        options: [
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'lure-id'],
      },
      (console, spec) => {
        console.log(
          `When enabled, the URL path becomes active and can be used to serve ` +
            `the associated redirector content.\n`
        )

        console.log(
          `// Enables the 'test' lure in 'hackernews' campaign:\n` +
            `.${spec.name} hackernews test -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.lureService.enable({
          campaignId: args._[0],
          lureId: args._[1],
          lockSecret: args.lockSecret,
        })

        console.log(`Lure enabled!`)
      }
    )

    this.router.addCommand<ToggleLureArgs>(
      {
        name: 'lure-disable',
        description: `Disables the lure, stopping request routing.`,
        schemaName: 'console-toggle-lure-args',
        options: [
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'lure-id'],
      },
      (console, spec) => {
        console.log(`When disabled, requests to the URL path will not be routed.\n`)

        console.log(
          `// Disables the 'test' lure in 'hackernews' campaign:\n` +
            `.${spec.name} hackernews test -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.lureService.disable({
          campaignId: args._[0],
          lureId: args._[1],
          lockSecret: args.lockSecret,
        })

        console.log(`Lure disabled!`)
      }
    )

    this.router.addCommand<DeleteLureArgs>(
      {
        name: 'lure-delete',
        description: `Deletes the lure by its ID.`,
        schemaName: 'console-delete-lure-args',
        options: [
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'lure-id', 'redirector-id'],
      },
      (console, spec) => {
        console.log(`A lure must be disabled before it can be deleted.\n`)

        console.log(
          `// Deletes the 'test' lure in 'hackernews' campaign:\n` +
            `.${spec.name} hackernews test -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.lureService.delete({
          campaignId: args._[0],
          lureId: args._[1],
          redirectorId: args._[2],
          lockSecret: args.lockSecret,
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
        console.log(`Returns the array of lure models.\n`)

        console.log(`The lures are ordered by creation time (oldest first).\n`)

        console.log(`// Lists all lures in 'hackernews' campaign:\n` + `.${spec.name} hackernews\n`)
      },
      async (console, spec, args) => {
        const lures = await this.lureService.list({
          campaignId: args._[0],
        })

        this.showLureCollection(console, lures)
      }
    )

    this.router.addCommand<MakeLureUrlArgs>(
      {
        name: 'lure-make-url',
        description: `Makes the lure URL with optional params.`,
        schemaName: 'console-make-lure-url-args',
        options: [
          {
            name: 'params',
            description: `The params to use.`,
            type: 'string',
            alias: 'p',
          },
        ],
        params: ['campaign-id', 'lure-id', 'target-id'],
      },
      (console, spec) => {
        console.log(`Returns the lure URL string.\n`)

        console.log(
          `// Makes a URL for 'test' lure in 'hackernews' campaign via 'root' target:\n` +
            `.${spec.name} hackernews test root --params "{\\"foo\\": \\"bar\\"}"\n`
        )
      },
      async (console, spec, args) => {
        const url = await this.lureService.makeUrl({
          campaignId: args._[0],
          lureId: args._[1],
          targetId: args._[2],
          params: JSON.parse(args.params) as RedirectorParams, // FIXME
        })

        console.log(`Lure URL: ${url}`)
      }
    )
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

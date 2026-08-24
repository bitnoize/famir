import { DIContainer } from '@famir/common'
import { FullTargetModel, TargetModel } from '@famir/database'
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
import { ListTargetsArgs, ReadTargetArgs, ReadTargetHostsArgs } from './target.js'
import {
  listTargetsArgsSchema,
  readTargetArgsSchema,
  readTargetHostsArgsSchema,
} from './target.schemas.js'
import { type TargetService, TARGET_SERVICE } from './target.service.js'

/**
 * DI token for the target controller.
 *
 * @category Target
 */
export const TARGET_CONTROLLER = Symbol('TargetController')

/**
 * Represents the target controller.
 *
 * @category Target
 */
export class TargetController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<TargetController>(
      TARGET_CONTROLLER,
      (c) =>
        new TargetController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<ReplServerAssets>(REPL_SERVER_ASSETS),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<TargetService>(TARGET_SERVICE)
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
    return container.resolve<TargetController>(TARGET_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   * @param targetService - The target service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    assets: ReplServerAssets,
    router: ReplServerRouter,
    protected readonly targetService: TargetService
  ) {
    super(validator, logger, templater, assets, router)

    this.validator
      .addSchema('console-read-target-args', readTargetArgsSchema)
      .addSchema('console-read-target-hosts-args', readTargetHostsArgsSchema)
      .addSchema('console-list-targets-args', listTargetsArgsSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<ReadTargetArgs>(
      {
        name: 'target-read',
        description: `Reads the target by its ID.`,
        schemaName: 'console-read-target-args',
        options: [],
        params: ['campaign-id', 'target-id'],
      },
      (console, spec) => {
        console.log(`// Reads the 'root' target in the 'httpbin' campaign:`)
        console.log(`.${spec.name} httpbin root\n`)
      },
      async (console, spec, args) => {
        const [campaignId, targetId] = args._

        const target = await this.targetService.read({
          campaignId,
          targetId,
        })

        this.showTargetModel(console, target)
      }
    )

    this.router.addCommand<ReadTargetHostsArgs>(
      {
        name: 'target-read-hosts',
        description: `Reads all target hosts across all campaigns.`,
        schemaName: 'console-read-target-hosts-args',
        options: [],
      },
      (console, spec) => {
        console.log(`// Reads targets hosts:`)
        console.log(`.${spec.name}\n`)
      },
      async (console) => {
        const targetHosts = await this.targetService.readHosts()

        console.log(targetHosts)
      }
    )

    this.router.addCommand<ListTargetsArgs>(
      {
        name: 'target-list',
        description: `Lists all targets for the campaign.`,
        schemaName: 'console-list-targets-args',
        options: [],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`The targets are ordered by creation time (oldest first).\n`)

        console.log(`// Lists all targets in the 'httpbin' campaign:`)
        console.log(`.${spec.name} httpbin\n`)
      },
      async (console, spec, args) => {
        const [campaignId] = args._

        const targets = await this.targetService.list({
          campaignId,
        })

        this.showTargetCollection(console, targets)
      }
    )
  }

  private showTargetModel(console: Console, target: FullTargetModel) {
    console.table({
      campaignId: target.campaignId,
      targetId: target.targetId,
      accessLevel: target.accessLevel,
      donor: target.donorUrl,
      mirror: target.mirrorUrl,
      labels: target.labels.join(', '),
      connectTimeout: target.connectTimeout,
      simpleTimeout: target.simpleTimeout,
      streamTimeout: target.streamTimeout,
      headersSizeLimit: target.headersSizeLimit,
      bodySizeLimit: target.bodySizeLimit,
      mainPage: target.mainPage.length,
      notFoundPage: target.notFoundPage.length,
      faviconIco: target.faviconIco.length,
      robotsTxt: target.robotsTxt.length,
      sitemapXml: target.sitemapXml.length,
      allowWebSockets: target.allowWebSockets,
      isEnabled: target.isEnabled,
      messageCount: target.messageCount,
      createdAt: target.createdAt.toISOString(),
    })
  }

  private showTargetCollection(console: Console, targets: TargetModel[]) {
    console.table(
      targets.map((target) => {
        return {
          campaignId: target.campaignId,
          targetId: target.targetId,
          accessLevel: target.accessLevel,
          //donor: target.donorUrl,
          //mirror: target.mirrorUrl,
          isEnabled: target.isEnabled,
          messageCount: target.messageCount,
          createdAt: target.createdAt.toISOString(),
        }
      })
    )
  }
}

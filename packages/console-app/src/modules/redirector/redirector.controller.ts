import { DIContainer } from '@famir/common'
import { FullRedirectorModel, RedirectorModel } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import {
  REPL_SERVER_ASSETS,
  REPL_SERVER_ROUTER,
  ReplServerAssets,
  ReplServerRouter,
} from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { ListRedirectorsArgs, ReadRedirectorArgs } from './redirector.js'
import { listRedirectorsArgsSchema, readRedirectorArgsSchema } from './redirector.schemas.js'
import { type RedirectorService, REDIRECTOR_SERVICE } from './redirector.service.js'

/**
 * DI token for the redirector controller.
 *
 * @category Redirector
 */
export const REDIRECTOR_CONTROLLER = Symbol('RedirectorController')

/**
 * Represents the redirector controller.
 *
 * @category Redirector
 */
export class RedirectorController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<RedirectorController>(
      REDIRECTOR_CONTROLLER,
      (c) =>
        new RedirectorController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerAssets>(REPL_SERVER_ASSETS),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<RedirectorService>(REDIRECTOR_SERVICE)
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
    return container.resolve<RedirectorController>(REDIRECTOR_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param assets - The repl-server assets instance.
   * @param router - The repl-server router instance.
   * @param redirectorService - The redirector service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    assets: ReplServerAssets,
    router: ReplServerRouter,
    protected readonly redirectorService: RedirectorService
  ) {
    super(validator, logger, assets, router)

    this.validator
      .addSchema('console-read-redirector-args', readRedirectorArgsSchema)
      .addSchema('console-list-redirectors-args', listRedirectorsArgsSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<ReadRedirectorArgs>(
      {
        name: 'redirector-read',
        description: `Reads the redirector by its ID.`,
        schemaName: 'console-read-redirector-args',
        options: [],
        params: ['campaign-id', 'redirector-id'],
      },
      (console, spec) => {
        console.log(`// Reads the 'simple' redirector in 'hackernews' campaign:`)
        console.log(`.${spec.name} hackernews simple\n`)
      },
      async (console, spec, args) => {
        const [campaignId, redirectorId] = args._

        const redirector = await this.redirectorService.read({
          campaignId,
          redirectorId,
        })

        this.showRedirectorModel(console, redirector)
      }
    )

    this.router.addCommand<ListRedirectorsArgs>(
      {
        name: 'redirector-list',
        description: `Lists all redirectors for the campaign.`,
        schemaName: 'console-list-redirectors-args',
        options: [],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`The redirectors are ordered by creation time (oldest first).\n`)

        console.log(`// Lists redirectors of the 'hackernews' campaign:`)
        console.log(`.${spec.name} hackernews\n`)
      },
      async (console, spec, args) => {
        const [campaignId] = args._

        const redirectors = await this.redirectorService.list({
          campaignId,
        })

        this.showRedirectorCollection(console, redirectors)
      }
    )
  }

  private showRedirectorModel(console: Console, redirector: FullRedirectorModel) {
    console.table({
      campaignId: redirector.campaignId,
      redirectorId: redirector.redirectorId,
      page: redirector.page.length,
      lureCount: redirector.lureCount,
      createdAt: redirector.createdAt.toISOString(),
    })
  }

  private showRedirectorCollection(console: Console, redirectors: RedirectorModel[]) {
    console.table(
      redirectors.map((redirector) => {
        return {
          campaignId: redirector.campaignId,
          redirectorId: redirector.redirectorId,
          lureCount: redirector.lureCount,
          createdAt: redirector.createdAt.toISOString(),
        }
      })
    )
  }
}

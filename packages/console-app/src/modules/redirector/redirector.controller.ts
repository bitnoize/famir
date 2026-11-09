import { DIContainer } from '@famir/common'
import {
  FullRedirectorModel,
  Logger,
  LOGGER,
  RedirectorModel,
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
import { ListRedirectorsArgs, ReadRedirectorArgs } from './redirector.js'
import { listRedirectorsArgsSchema, readRedirectorArgsSchema } from './redirector.schemas.js'
import { REDIRECTOR_SERVICE, type RedirectorService } from './redirector.service.js'

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
        new this(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
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
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   * @param redirectorService - The redirector service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    assets: ReplServerAssets,
    router: ReplServerRouter,
    protected readonly redirectorService: RedirectorService
  ) {
    super(validator, logger, templater, assets, router)
  }

  init(): this {
    this.validator
      .addSchema('console-read-redirector-args', readRedirectorArgsSchema)
      .addSchema('console-list-redirectors-args', listRedirectorsArgsSchema)

    return this
  }

  main(): this {
    this.router.add<ReadRedirectorArgs>(
      {
        name: 'redirector-read',
        description: `Reads the redirector by its ID.`,
        schemaName: 'console-read-redirector-args',
        options: [],
        params: ['campaign-id', 'redirector-id'],
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

    this.router.add<ListRedirectorsArgs>(
      {
        name: 'redirector-list',
        description: `Lists all redirectors for the campaign.`,
        schemaName: 'console-list-redirectors-args',
        options: [],
        params: ['campaign-id'],
      },
      async (console, spec, args) => {
        const [campaignId] = args._

        const redirectors = await this.redirectorService.list({
          campaignId,
        })

        this.showRedirectorCollection(console, redirectors)
      }
    )

    return this
  }

  private showRedirectorModel(console: Console, redirector: FullRedirectorModel) {
    console.table({
      campaignId: redirector.campaignId,
      redirectorId: redirector.redirectorId,
      page: redirector.page.length,
      lureCount: redirector.lureCount,
      createdAt: redirector.createdAt.toISOString(),
    })

    console.log(`Required fields: ${redirector.fields.join(', ')}`)
  }

  private showRedirectorCollection(console: Console, redirectors: RedirectorModel[]) {
    console.table(
      redirectors.map((redirector) => {
        return {
          //campaignId: redirector.campaignId,
          redirectorId: redirector.redirectorId,
          lureCount: redirector.lureCount,
          createdAt: redirector.createdAt.toISOString(),
        }
      })
    )
  }
}

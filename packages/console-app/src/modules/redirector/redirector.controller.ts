import { DIContainer } from '@famir/common'
import { FullRedirectorModel, RedirectorModel, redirectorPageSchema } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  AlterRedirectorFieldArgs,
  CreateRedirectorArgs,
  DeleteRedirectorArgs,
  ListRedirectorsArgs,
  ReadRedirectorArgs,
  UpdateRedirectorArgs,
} from './redirector.js'
import {
  alterRedirectorFieldArgsSchema,
  createRedirectorArgsSchema,
  deleteRedirectorArgsSchema,
  listRedirectorsArgsSchema,
  readRedirectorArgsSchema,
  updateRedirectorArgsSchema,
} from './redirector.schemas.js'
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
   * @param router - The repl-server router instance.
   * @param redirectorService - The redirector service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly redirectorService: RedirectorService
  ) {
    super(validator, logger, router)

    this.validator
      .addSchema('console-redirector-page', redirectorPageSchema)
      .addSchema('console-create-redirector-args', createRedirectorArgsSchema)
      .addSchema('console-read-redirector-args', readRedirectorArgsSchema)
      .addSchema('console-update-redirector-args', updateRedirectorArgsSchema)
      .addSchema('console-alter-redirector-field-args', alterRedirectorFieldArgsSchema)
      .addSchema('console-delete-redirector-args', deleteRedirectorArgsSchema)
      .addSchema('console-list-redirectors-args', listRedirectorsArgsSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<CreateRedirectorArgs>(
      {
        name: 'redirector-create',
        description: `Creates a new redirector.`,
        schemaName: 'console-create-redirector-args',
        options: [
          {
            name: 'page-file',
            description: `The path to file with page template.`,
            type: 'string',
            default: null,
          },
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'redirector-id'],
      },
      (console, spec) => {
        console.log(`Returns the redirector model.\n`)

        console.log(
          `// Creates a 'simple' redirector in 'hackernews' campaign:\n` +
            `.${spec.name} hackernews simple --page-file misc/redirectors/simple.html -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        let page: string = ''

        if (args.pageFile) {
          const body = await this.readFile(args.pageFile)

          page = this.parsePageFile(body)
        }

        const redirector = await this.redirectorService.create({
          campaignId: args._[0],
          redirectorId: args._[1],
          page,
          lockSecret: args.lockSecret,
        })

        this.showRedirectorModel(console, redirector)
      }
    )

    this.router.addCommand<ReadRedirectorArgs>(
      {
        name: 'redirector-read',
        description: `Reads the redirector by its ID.`,
        schemaName: 'console-read-redirector-args',
        options: [],
        params: ['campaign-id', 'redirector-id'],
      },
      (console, spec) => {
        console.log(`Returns the redirector model.\n`)

        console.log(
          `// Reads the 'simple' redirector in 'hackernews' campaign:\n` +
            `.${spec.name} hackernews simple\n`
        )
      },
      async (console, spec, args) => {
        const redirector = await this.redirectorService.read({
          campaignId: args._[0],
          redirectorId: args._[1],
        })

        this.showRedirectorModel(console, redirector)
      }
    )

    this.router.addCommand<UpdateRedirectorArgs>(
      {
        name: 'redirector-update',
        description: `Updates the redirector specific fields.`,
        schemaName: 'console-update-redirector-args',
        options: [
          {
            name: 'page-file',
            description: `The path to file with page template.`,
            type: 'string',
            default: null,
          },
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'redirector-id'],
      },
      (console, spec) => {
        console.log(`All update parameters are optional. Only provided fields will be updated.\n`)

        console.log(
          `// Updates the 'simple' redirector page:\n` +
            `.${spec.name} hackernews simple --page-file misc/redirectors/simple.html -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        let page: string | null = null

        if (args.pageFile) {
          const body = await this.readFile(args.pageFile)

          page = this.parsePageFile(body)
        }

        await this.redirectorService.update({
          campaignId: args._[0],
          redirectorId: args._[1],
          page,
          lockSecret: args.lockSecret,
        })

        console.log(`Redirector updated!`)
      }
    )

    this.router.addCommand<AlterRedirectorFieldArgs>(
      {
        name: 'redirector-append-field',
        description: `Appends a required field to the redirector.`,
        schemaName: 'console-alter-redirector-field-args',
        options: [
          {
            name: 'field',
            description: `The field name to append to the fields list.`,
            type: 'string',
          },
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'redirector-id'],
      },
      (console, spec) => {
        console.log(
          `// Append field to 'simple' redirector:\n` +
            `.${spec.name} hackernews simple --field firstName -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.redirectorService.appendField({
          campaignId: args._[0],
          redirectorId: args._[1],
          field: args.field,
          lockSecret: args.lockSecret,
        })

        console.log(`Redirector field appended!`)
      }
    )

    this.router.addCommand<AlterRedirectorFieldArgs>(
      {
        name: 'redirector-remove-field',
        description: `Removes a required field from the redirector.`,
        schemaName: 'console-alter-redirector-field-args',
        options: [
          {
            name: 'field',
            description: `The field name to remove from the fields list.`,
            type: 'string',
          },
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'redirector-id'],
      },
      (console, spec) => {
        console.log(
          `// Remove field from 'simple' redirector:\n` +
            `.${spec.name} hackernews simple --field firstName -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.redirectorService.removeField({
          campaignId: args._[0],
          redirectorId: args._[1],
          field: args.field,
          lockSecret: args.lockSecret,
        })

        console.log(`Redirector field removed!`)
      }
    )

    this.router.addCommand<DeleteRedirectorArgs>(
      {
        name: 'redirector-delete',
        description: `Deletes the redirector by its ID.`,
        schemaName: 'console-delete-redirector-args',
        options: [
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'redirector-id'],
      },
      (console, spec) => {
        console.log(
          `// Deletes the 'simple' redirector from the 'hackernews' campaign:\n` +
            `.${spec.name} hackernews test -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.redirectorService.delete({
          campaignId: args._[0],
          redirectorId: args._[1],
          lockSecret: args.lockSecret,
        })

        console.log(`Redirector deleted!`)
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
        console.log(`Returns the array of redirector models.\n`)

        console.log(`The redirectors are ordered by creation time (oldest first).\n`)

        console.log(
          `// Lists all redirectors in 'hackernews' campaign:\n` + `.${spec.name} hackernews\n`
        )
      },
      async (console, spec, args) => {
        const redirectors = await this.redirectorService.list({
          campaignId: args._[0],
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

  protected parsePageFile(body: Buffer): string {
    const page = this.buf2str(body)

    this.validateData<string>('console-redirector-page', page)

    return page
  }
}

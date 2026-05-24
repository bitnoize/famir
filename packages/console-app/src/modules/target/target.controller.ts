import { DIContainer } from '@famir/common'
import { FullTargetModel, targetContentSchema, TargetModel } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  AlterTargetLabelArgs,
  CreateTargetArgs,
  DeleteTargetArgs,
  ListTargetsArgs,
  ReadTargetArgs,
  ReadTargetHostsArgs,
  ToggleTargetArgs,
  UpdateTargetArgs,
} from './target.js'
import {
  alterTargetLabelArgsSchema,
  createTargetArgsSchema,
  deleteTargetArgsSchema,
  listTargetsArgsSchema,
  readTargetArgsSchema,
  readTargetHostsArgsSchema,
  toggleTargetArgsSchema,
  updateTargetArgsSchema,
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
  static register(container: DIContainer) {
    /**
     * Registers the controller as a singleton in the DI container.
     *
     * @param container - The DI container to register in.
     */
    container.registerSingleton<TargetController>(
      TARGET_CONTROLLER,
      (c) =>
        new TargetController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
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
   * @param router - The repl-server router instance.
   * @param targetService - The target service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly targetService: TargetService
  ) {
    super(validator, logger, router)

    this.validator
      .addSchema('console-target-content', targetContentSchema)
      .addSchema('console-create-target-args', createTargetArgsSchema)
      .addSchema('console-read-target-args', readTargetArgsSchema)
      .addSchema('console-read-target-hosts-args', readTargetHostsArgsSchema)
      .addSchema('console-update-target-args', updateTargetArgsSchema)
      .addSchema('console-toggle-target-args', toggleTargetArgsSchema)
      .addSchema('console-alter-target-label-args', alterTargetLabelArgsSchema)
      .addSchema('console-delete-target-args', deleteTargetArgsSchema)
      .addSchema('console-list-targets-args', listTargetsArgsSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<CreateTargetArgs>(
      {
        name: 'target-create',
        description: `Creates a new target.`,
        schemaName: 'console-create-target-args',
        options: [
          {
            name: 'access-level',
            description: `The access level, 'transparent' or 'landing'.`,
            type: 'string',
          },
          {
            name: 'donor-secure',
            description: `The flag indicating if the donor server uses HTTPS.`,
            type: 'boolean',
            default: false,
          },
          {
            name: 'donor-sub',
            description: `The donor subdomain.`,
            type: 'string',
          },
          {
            name: 'donor-domain',
            description: `The donor domain name.`,
            type: 'string',
          },
          {
            name: 'donor-port',
            description: `The donor server port.`,
            type: 'number',
            default: null,
          },
          {
            name: 'mirror-secure',
            description: `The flag indicating if the mirror server uses HTTPS.`,
            type: 'boolean',
            default: false,
          },
          {
            name: 'mirror-sub',
            description: `The mirror subdomain.`,
            type: 'string',
          },
          {
            name: 'mirror-port',
            description: `The mirror server port.`,
            type: 'number',
            default: null,
          },
          {
            name: 'connect-timeout',
            description: `The connection timeout in milliseconds.`,
            type: 'number',
            default: 10 * 1000, // 10 sec
          },
          {
            name: 'simple-timeout',
            description: `The simple request timeout in milliseconds.`,
            type: 'number',
            default: 60 * 1000, // 1 min
          },
          {
            name: 'stream-timeout',
            description: `The streaming request timeout in milliseconds.`,
            type: 'number',
            default: 300 * 1000, // 5 min
          },
          {
            name: 'headers-size-limit',
            description: `The maximum headers size in bytes.`,
            type: 'number',
            default: 10 * 1024, // 10 kb
          },
          {
            name: 'body-size-limit',
            description: `The maximum body size in bytes.`,
            type: 'number',
            default: 10 * 1024 * 1024, // 10 mb
          },
          {
            name: 'main-page-file',
            description: `The path to file with custom main page content.`,
            type: 'string',
            default: null,
          },
          {
            name: 'not-found-page-file',
            description: `The path to file with custom not-found page content.`,
            type: 'string',
            default: null,
          },
          {
            name: 'favicon-ico-file',
            description: `The path to file with custom favicon.ico content.`,
            type: 'string',
            default: null,
          },
          {
            name: 'robots-txt-file',
            description: `The path to file with custom robots.txt content.`,
            type: 'string',
            default: null,
          },
          {
            name: 'sitemap-xml-file',
            description: `The path to file with custom sitemap.xml content.`,
            type: 'string',
            default: null,
          },
          {
            name: 'allow-web-sockets',
            description: `The flag indicating if WebSocket connections allowed.`,
            type: 'boolean',
            default: false,
          },
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'target-id'],
      },
      (console, spec) => {
        console.log(`Returns the target model.\n`)

        console.log(
          `The target will be created in a disabled state (isEnabled = false).\n` +
            `Use '.target-enable' command to activate it for traffic routing.\n`
        )

        console.log(
          `// Creates a 'root' target in 'httpbin' campaign:\n` +
            `.${spec.name} httpbin root ... -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        if (args.donorPort == null) {
          args.donorPort = args.donorSecure ? 443 : 80
        }

        if (args.mirrorPort == null) {
          args.mirrorPort = args.mirrorSecure ? 443 : 80
        }

        let mainPage: string = ''
        let notFoundPage: string = ''
        let faviconIco: string = ''
        let robotsTxt: string = ''
        let sitemapXml: string = ''

        if (args.mainPageFile) {
          const body = await this.readFile(args.mainPageFile)

          mainPage = this.parseMainPageFile(body)
        }

        if (args.notFoundPageFile) {
          const body = await this.readFile(args.notFoundPageFile)

          notFoundPage = this.parseNotFoundPageFile(body)
        }

        if (args.faviconIcoFile) {
          const body = await this.readFile(args.faviconIcoFile)

          faviconIco = this.parseFaviconIcoFile(body)
        }

        if (args.robotsTxtFile) {
          const body = await this.readFile(args.robotsTxtFile)

          robotsTxt = this.parseRobotsTxtFile(body)
        }

        if (args.sitemapXmlFile) {
          const body = await this.readFile(args.sitemapXmlFile)

          sitemapXml = this.parseSitemapXmlFile(body)
        }

        const target = await this.targetService.create({
          campaignId: args._[0],
          targetId: args._[1],
          accessLevel: args.accessLevel,
          donorSecure: args.donorSecure,
          donorSub: args.donorSub,
          donorDomain: args.donorDomain,
          donorPort: args.donorPort,
          mirrorSecure: args.mirrorSecure,
          mirrorSub: args.mirrorSub,
          mirrorPort: args.mirrorPort,
          connectTimeout: args.connectTimeout,
          simpleTimeout: args.simpleTimeout,
          streamTimeout: args.streamTimeout,
          headersSizeLimit: args.headersSizeLimit,
          bodySizeLimit: args.bodySizeLimit,
          mainPage,
          notFoundPage,
          faviconIco,
          robotsTxt,
          sitemapXml,
          allowWebSockets: args.allowWebSockets,
          lockSecret: args.lockSecret,
        })

        this.showTargetModel(console, target)
      }
    )

    this.router.addCommand<ReadTargetArgs>(
      {
        name: 'target-read',
        description: `Reads the target by its ID.`,
        schemaName: 'console-read-target-args',
        options: [],
        params: ['campaign-id', 'target-id'],
      },
      (console, spec) => {
        console.log(`Returns the target model.\n`)

        console.log(`// Reads a 'root' target in 'httpbin' campaign:\n.${spec.name} httpbin root\n`)
      },
      async (console, spec, args) => {
        const target = await this.targetService.read({
          campaignId: args._[0],
          targetId: args._[1],
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
        console.log(`Returns the dictionary of target hosts and their links.\n`)

        console.log(`// Reads targets hosts:\n.${spec.name}\n`)
      },
      async (console) => {
        const targetHosts = await this.targetService.readHosts()

        console.log(targetHosts)
      }
    )

    this.router.addCommand<UpdateTargetArgs>(
      {
        name: 'target-update',
        description: `Updates the target specific fields.`,
        schemaName: 'console-update-target-args',
        options: [
          {
            name: 'connect-timeout',
            description: `The connection timeout in milliseconds.`,
            type: 'number',
            default: null,
          },
          {
            name: 'simple-timeout',
            description: `The simple request timeout in milliseconds.`,
            type: 'number',
            default: null,
          },
          {
            name: 'stream-timeout',
            description: `The streaming request timeout in milliseconds.`,
            type: 'number',
            default: null,
          },
          {
            name: 'headers-size-limit',
            description: `The maximum headers size in bytes.`,
            type: 'number',
            default: null,
          },
          {
            name: 'body-size-limit',
            description: `The maximum body size in bytes.`,
            type: 'number',
            default: null,
          },
          {
            name: 'main-page-file',
            description: `The path to file with custom main page content.`,
            type: 'string',
            default: null,
          },
          {
            name: 'not-found-page-file',
            description: `The path to file with custom not-found page content.`,
            type: 'string',
            default: null,
          },
          {
            name: 'favicon-ico-file',
            description: `The path to file with custom favicon.ico content.`,
            type: 'string',
            default: null,
          },
          {
            name: 'robots-txt-file',
            description: `The path to file with custom robots.txt content.`,
            type: 'string',
            default: null,
          },
          {
            name: 'sitemap-xml-file',
            description: `The path to file with custom sitemap.xml content.`,
            type: 'string',
            default: null,
          },
          {
            name: 'allow-web-sockets',
            description: `The flag indicating if WebSocket connections allowed.`,
            type: 'boolean',
            default: null,
          },
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'target-id'],
      },
      (console, spec) => {
        console.log(`All update parameters are optional. Only provided fields will be updated.\n`)

        console.log(
          `// Updates the 'root' target body-size-limit:\n` +
            `.${spec.name} httpbin root --body-size-limit 20971520  -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        let mainPage: string | null = null
        let notFoundPage: string | null = null
        let faviconIco: string | null = null
        let robotsTxt: string | null = null
        let sitemapXml: string | null = null

        if (args.mainPageFile) {
          const body = await this.readFile(args.mainPageFile)

          mainPage = this.parseMainPageFile(body)
        }

        if (args.notFoundPageFile) {
          const body = await this.readFile(args.notFoundPageFile)

          notFoundPage = this.parseNotFoundPageFile(body)
        }

        if (args.faviconIcoFile) {
          const body = await this.readFile(args.faviconIcoFile)

          faviconIco = this.parseFaviconIcoFile(body)
        }

        if (args.robotsTxtFile) {
          const body = await this.readFile(args.robotsTxtFile)

          robotsTxt = this.parseRobotsTxtFile(body)
        }

        if (args.sitemapXmlFile) {
          const body = await this.readFile(args.sitemapXmlFile)

          sitemapXml = this.parseSitemapXmlFile(body)
        }

        await this.targetService.update({
          campaignId: args._[0],
          targetId: args._[1],
          connectTimeout: args.connectTimeout,
          simpleTimeout: args.simpleTimeout,
          streamTimeout: args.streamTimeout,
          headersSizeLimit: args.headersSizeLimit,
          bodySizeLimit: args.bodySizeLimit,
          mainPage,
          notFoundPage,
          faviconIco,
          robotsTxt,
          sitemapXml,
          allowWebSockets: args.allowWebSockets,
          lockSecret: args.lockSecret,
        })

        console.log(`Target updated!`)
      }
    )

    this.router.addCommand<ToggleTargetArgs>(
      {
        name: 'target-enable',
        description: `Enables the target, making it available for traffic routing.`,
        schemaName: 'console-toggle-target-args',
        options: [
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'target-id'],
      },
      (console, spec) => {
        console.log(
          `When enabled, the mirror hostname becomes active and can be used ` +
            `for proxying requests to the donor server.\n`
        )

        console.log(
          `// Enables the 'root' target in 'httpbin' campaign:\n` +
            `.${spec.name} httpbin root -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.targetService.enable({
          campaignId: args._[0],
          targetId: args._[1],
          lockSecret: args.lockSecret,
        })

        console.log(`Target enabled!`)
      }
    )

    this.router.addCommand<ToggleTargetArgs>(
      {
        name: 'target-disable',
        description: `Disables the target, stopping traffic routing.`,
        schemaName: 'console-toggle-target-args',
        options: [
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'target-id'],
      },
      (console, spec) => {
        console.log(`When disabled, requests to the mirror hostname will not be proxied.\n`)

        console.log(
          `// Disables the 'root' target in 'httpbin' campaign:\n` +
            `.${spec.name} httpbin root -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.targetService.disable({
          campaignId: args._[0],
          targetId: args._[1],
          lockSecret: args.lockSecret,
        })

        console.log(`Target disabled!`)
      }
    )

    this.router.addCommand<AlterTargetLabelArgs>(
      {
        name: 'target-append-label',
        description: `Appends a label to the target.`,
        schemaName: 'console-alter-target-label-args',
        options: [
          {
            name: 'label',
            description: `The label to append to the target.`,
            type: 'string',
          },
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'target-id'],
      },
      (console, spec) => {
        console.log(
          `Labels are used for categorization and filtering of targets.\n` +
            `The label is automatically converted to lowercase.\n`
        )

        console.log(
          `// Append label to 'root' target:\n` +
            `.${spec.name} httpbin root --label custom -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.targetService.appendLabel({
          campaignId: args._[0],
          targetId: args._[1],
          label: args.label,
          lockSecret: args.lockSecret,
        })

        console.log(`Target label appended!`)
      }
    )

    this.router.addCommand<AlterTargetLabelArgs>(
      {
        name: 'target-remove-label',
        description: `Removes a label from the target.`,
        schemaName: 'console-alter-target-label-args',
        options: [
          {
            name: 'label',
            description: `The label to remove from the target.`,
            type: 'string',
          },
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'target-id'],
      },
      (console, spec) => {
        console.log(
          `// Remove label from 'root' target:\n` +
            `.${spec.name} httpbin root --label custom -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.targetService.removeLabel({
          campaignId: args._[0],
          targetId: args._[1],
          label: args.label,
          lockSecret: args.lockSecret,
        })

        console.log(`Target label removed!`)
      }
    )

    this.router.addCommand<DeleteTargetArgs>(
      {
        name: 'target-delete',
        description: `Deletes the target by its ID.`,
        schemaName: 'console-delete-target-args',
        options: [
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'target-id'],
      },
      (console, spec) => {
        console.log(`A target must be disabled before it can be deleted.\n`)

        console.log(
          `// Deletes the 'root' target in 'httpbin' campaign:\n` +
            `.${spec.name} httpbin root -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.targetService.delete({
          campaignId: args._[0],
          targetId: args._[1],
          lockSecret: args.lockSecret,
        })

        console.log(`Target deleted!`)
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
        console.log(`Returns the array of target models.\n`)

        console.log(`The targets are ordered by creation time (oldest first).\n`)

        console.log(`// Lists all targets in 'httpbin' campaign:\n` + `.${spec.name} httpbin\n`)
      },
      async (console, spec, args) => {
        const targets = await this.targetService.list({
          campaignId: args._[0],
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

  protected parseMainPageFile(body: Buffer): string {
    const mainPage = this.buf2str(body)

    this.validateData<string>('console-target-content', mainPage)

    return mainPage
  }

  protected parseNotFoundPageFile(body: Buffer): string {
    const notFountPage = this.buf2str(body)

    this.validateData<string>('console-target-content', notFountPage)

    return notFountPage
  }

  protected parseFaviconIcoFile(body: Buffer): string {
    const faviconIco = this.encodeBase64(body)

    this.validateData<string>('console-target-content', faviconIco)

    return faviconIco
  }

  protected parseRobotsTxtFile(body: Buffer): string {
    const robotsTxt = this.buf2str(body)

    this.validateData<string>('console-target-content', robotsTxt)

    return robotsTxt
  }

  protected parseSitemapXmlFile(body: Buffer): string {
    const sitemapXml = this.buf2str(body)

    this.validateData<string>('console-target-content', sitemapXml)

    return sitemapXml
  }
}

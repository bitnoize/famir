import { DIContainer } from '@famir/common'
import { ProxyModel } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  CreateProxyArgs,
  DeleteProxyArgs,
  ListProxiesArgs,
  ReadProxyArgs,
  ToggleProxyArgs,
} from './proxy.js'
import {
  createProxyArgsSchema,
  deleteProxyArgsSchema,
  listProxiesArgsSchema,
  readProxyArgsSchema,
  toggleProxyArgsSchema,
} from './proxy.schemas.js'
import { type ProxyService, PROXY_SERVICE } from './proxy.service.js'

/**
 * DI token for the proxy controller.
 *
 * @category Proxy
 */
export const PROXY_CONTROLLER = Symbol('ProxyController')

/**
 * Represents the proxy controller.
 *
 * @category Proxy
 */
export class ProxyController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ProxyController>(
      PROXY_CONTROLLER,
      (c) =>
        new ProxyController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<ProxyService>(PROXY_SERVICE)
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
    return container.resolve<ProxyController>(PROXY_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param router - The repl-server router instance.
   * @param proxyService - The proxy service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly proxyService: ProxyService
  ) {
    super(validator, logger, router)

    this.validator
      .addSchema('console-create-proxy-args', createProxyArgsSchema)
      .addSchema('console-read-proxy-args', readProxyArgsSchema)
      .addSchema('console-toggle-proxy-args', toggleProxyArgsSchema)
      .addSchema('console-delete-proxy-args', deleteProxyArgsSchema)
      .addSchema('console-list-proxies-args', listProxiesArgsSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<CreateProxyArgs>(
      {
        name: 'proxy-create',
        description: `Creates a new proxy.`,
        schemaName: 'console-create-proxy-args',
        options: [
          {
            name: 'url',
            description: `The upstream URL for the proxy.`,
            type: 'string',
          },
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'proxy-id'],
      },
      (console, spec) => {
        console.log(`Returns the proxy model.\n`)

        console.log(
          `The proxy will be created in a disabled state (isEnabled = false).\n` +
            `Use '.proxy-enable' command to activate it for traffic routing.\n`
        )

        console.log(
          `// Creates a 'tor' proxy in 'httpbin' campaign:\n` +
            `.${spec.name} httpbin tor --url socks5://127.0.0.1:9050 -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        const proxy = await this.proxyService.create({
          campaignId: args._[0],
          proxyId: args._[1],
          url: args.url,
          lockSecret: args.lockSecret,
        })

        this.showProxyModel(console, proxy)
      }
    )

    this.router.addCommand<ReadProxyArgs>(
      {
        name: 'proxy-read',
        description: `Reads the proxy by its ID.`,
        schemaName: 'console-read-proxy-args',
        options: [],
        params: ['campaign-id', 'proxy-id'],
      },
      (console, spec) => {
        console.log(`Returns the proxy model.\n`)

        console.log(
          `// Reads a 'tor' proxy in 'httpbin' campaign:\n` + `.${spec.name} httpbin tor\n`
        )
      },
      async (console, spec, args) => {
        const proxy = await this.proxyService.read({
          campaignId: args._[0],
          proxyId: args._[1],
        })

        this.showProxyModel(console, proxy)
      }
    )

    this.router.addCommand<ToggleProxyArgs>(
      {
        name: 'proxy-enable',
        description: `Enables the proxy, making it available for traffic routing.`,
        schemaName: 'console-toggle-proxy-args',
        options: [
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'proxy-id'],
      },
      (console, spec) => {
        console.log(
          `Enabled proxies are automatically selected by the session creation logic ` +
            `using random load balancing.\n`
        )

        console.log(
          `// Enables the 'tor' proxy in 'httpbin' campaign:\n` +
            `.${spec.name} httpbin tor -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.proxyService.enable({
          campaignId: args._[0],
          proxyId: args._[1],
          lockSecret: args.lockSecret,
        })

        console.log(`Proxy enabled!`)
      }
    )

    this.router.addCommand<ToggleProxyArgs>(
      {
        name: 'proxy-disable',
        description: `Disables the proxy, stopping traffic routing.`,
        schemaName: 'console-toggle-proxy-args',
        options: [
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'proxy-id'],
      },
      (console, spec) => {
        console.log(
          `Existing sessions using this proxy will be automatically re-assigned ` +
            `to another enabled proxy upon their next authorization.\n`
        )

        console.log(
          `// Disables the 'tor' proxy in 'httpbin' campaign:\n` +
            `.${spec.name} httpbin tor -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.proxyService.disable({
          campaignId: args._[0],
          proxyId: args._[1],
          lockSecret: args.lockSecret,
        })

        console.log(`Proxy disabled!`)
      }
    )

    this.router.addCommand<DeleteProxyArgs>(
      {
        name: 'proxy-delete',
        description: `Deletes the proxy by its ID.`,
        schemaName: 'console-delete-proxy-args',
        options: [
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id', 'proxy-id'],
      },
      (console, spec) => {
        console.log(`A proxy must be disabled before it can be deleted.\n`)

        console.log(
          `// Deletes the 'tor' proxy in 'httpbin' campaign:\n` +
            `.${spec.name} httpbin tor -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.proxyService.delete({
          campaignId: args._[0],
          proxyId: args._[1],
          lockSecret: args.lockSecret,
        })

        console.log(`Proxy deleted!`)
      }
    )

    this.router.addCommand<ListProxiesArgs>(
      {
        name: 'proxy-list',
        description: `Lists all proxies for the campaign.`,
        schemaName: 'console-list-proxies-args',
        options: [],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`Returns the array of proxy models.\n`)

        console.log(`The proxies are ordered by creation time (oldest first).\n`)

        console.log(`// Lists all proxies in 'httpbin' campaign:\n` + `.${spec.name} httpbin\n`)
      },
      async (console, spec, args) => {
        const proxies = await this.proxyService.list({
          campaignId: args._[0],
        })

        this.showProxyCollection(console, proxies)
      }
    )
  }

  private showProxyModel(console: Console, proxy: ProxyModel) {
    console.table({
      campaignId: proxy.campaignId,
      proxyId: proxy.proxyId,
      url: proxy.url,
      isEnabled: proxy.isEnabled,
      messageCount: proxy.messageCount,
      createdAt: proxy.createdAt.toISOString(),
    })
  }

  private showProxyCollection(console: Console, proxies: ProxyModel[]) {
    console.table(
      proxies.map((proxy) => {
        return {
          campaignId: proxy.campaignId,
          proxyId: proxy.proxyId,
          url: proxy.url,
          isEnabled: proxy.isEnabled,
          messageCount: proxy.messageCount,
          createdAt: proxy.createdAt.toISOString(),
        }
      })
    )
  }
}

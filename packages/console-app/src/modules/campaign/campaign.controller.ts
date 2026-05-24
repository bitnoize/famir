import { DIContainer } from '@famir/common'
import { CampaignModel, FullCampaignModel } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { Console } from 'node:console'
import { BaseController } from '../base/index.js'
import {
  CreateCampaignArgs,
  DeleteCampaignArgs,
  ListCampaignsArgs,
  LockCampaignArgs,
  ReadCampaignArgs,
  UnlockCampaignArgs,
  UpdateCampaignArgs,
} from './campaign.js'
import {
  createCampaignArgsSchema,
  deleteCampaignArgsSchema,
  listCampaignsArgsSchema,
  lockCampaignArgsSchema,
  readCampaignArgsSchema,
  unlockCampaignArgsSchema,
  updateCampaignArgsSchema,
} from './campaign.schemas.js'
import { type CampaignService, CAMPAIGN_SERVICE } from './campaign.service.js'

/**
 * DI token for the campaign controller.
 *
 * @category Campaign
 */
export const CAMPAIGN_CONTROLLER = Symbol('CampaignController')

/**
 * Represents the campaign controller.
 *
 * @category Campaign
 */
export class CampaignController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<CampaignController>(
      CAMPAIGN_CONTROLLER,
      (c) =>
        new CampaignController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<CampaignService>(CAMPAIGN_SERVICE)
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
    return container.resolve<CampaignController>(CAMPAIGN_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param router - The repl-server router instance.
   * @param campaignService - The campaign service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly campaignService: CampaignService
  ) {
    super(validator, logger, router)

    this.validator
      .addSchema('console-create-campaign-args', createCampaignArgsSchema)
      .addSchema('console-read-campaign-args', readCampaignArgsSchema)
      .addSchema('console-lock-campaign-args', lockCampaignArgsSchema)
      .addSchema('console-unlock-campaign-args', unlockCampaignArgsSchema)
      .addSchema('console-update-campaign-args', updateCampaignArgsSchema)
      .addSchema('console-delete-campaign-args', deleteCampaignArgsSchema)
      .addSchema('console-list-campaigns-args', listCampaignsArgsSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<CreateCampaignArgs>(
      {
        name: 'campaign-create',
        description: `Creates a new campaign.`,
        schemaName: 'console-create-campaign-args',
        options: [
          {
            name: 'mirror-domain',
            description: `The public-facing mirror domain for the campaign.`,
            type: 'string',
          },
          {
            name: 'description',
            description: `The human-readable description for the campaign.`,
            type: 'string',
            default: '',
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
            default: '/fake-upgrade-session',
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
            default: 24 * 3600 * 1000,
          },
          {
            name: 'new-session-expire',
            description: `The TTL for a new session in milliseconds.`,
            type: 'number',
            default: 300 * 1000,
          },
          {
            name: 'message-expire',
            description: `The TTL for a message in milliseconds.`,
            type: 'number',
            default: 3600 * 1000,
          },
        ],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`Returns the campaign model.\n`)

        console.log(
          `// Creates a 'httpbin' campaign:\n` +
            `.${spec.name} httpbin --mirror-domain httpbin.fake\n`
        )

        console.log(
          `// Creates a 'hackernews' campaign:\n` +
            `.${spec.name} hackernews --mirror-domain hackernews.fake\n`
        )
      },
      async (console, spec, args) => {
        const campaign = await this.campaignService.create({
          campaignId: args._[0],
          mirrorDomain: args.mirrorDomain,
          description: args.description,
          cryptSecret: args.cryptSecret,
          upgradeSessionPath: args.upgradeSessionPath,
          sessionCookieName: args.sessionCookieName,
          sessionExpire: args.sessionExpire,
          newSessionExpire: args.newSessionExpire,
          messageExpire: args.messageExpire,
        })

        this.showCampaignModel(console, campaign)
      }
    )

    this.router.addCommand<ReadCampaignArgs>(
      {
        name: 'campaign-read',
        description: `Reads the campaign by ID.`,
        schemaName: 'console-read-campaign-args',
        options: [],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`Returns the campaign model.\n`)

        console.log(`// Reads a 'httpbin' campaign:\n` + `.${spec.name} httpbin\n`)
      },
      async (console, spec, args) => {
        const campaign = await this.campaignService.read({
          campaignId: args._[0],
        })

        this.showCampaignModel(console, campaign)
      }
    )

    this.router.addCommand<LockCampaignArgs>(
      {
        name: 'campaign-lock',
        description: `Acquires a distributed lock for the campaign.`,
        schemaName: 'console-lock-campaign-args',
        options: [],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`Returns the unique lock secret that must be used for subsequent operations.\n`)

        console.log(`This lock is required for any mutating operations.\n`)

        console.log(`// Locks a 'httpbin' campaign:\n` + `.${spec.name} httpbin\n`)
      },
      async (console, spec, args) => {
        const lockSecret = await this.campaignService.lock({
          campaignId: args._[0],
        })

        console.log(`Campaign locked!\nLock secret is: ${lockSecret}`)
      }
    )

    this.router.addCommand<UnlockCampaignArgs>(
      {
        name: 'campaign-unlock',
        description: `Releases a previously acquired lock on the campaign.`,
        schemaName: 'console-unlock-campaign-args',
        options: [
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`The lock secret must match the one returned by '.campaign-lock' command.\n`)

        console.log(`// Unlocks a 'httpbin' campaign:\n` + `.${spec.name} httpbin -s f2c2ef66...\n`)
      },
      async (console, spec, args) => {
        await this.campaignService.unlock({
          campaignId: args._[0],
          lockSecret: args.lockSecret,
        })

        console.log(`Campaign unlocked!`)
      }
    )

    this.router.addCommand<UpdateCampaignArgs>(
      {
        name: 'campaign-update',
        description: `Updates the campaign specific fields.`,
        schemaName: 'console-update-campaign-args',
        options: [
          {
            name: 'description',
            description: `The new human-readable description for the campaign.`,
            type: 'string',
            alias: 'd',
            default: null,
          },
          {
            name: 'session-expire',
            description: `The new TTL for an authorized session in milliseconds.`,
            type: 'number',
            default: null,
          },
          {
            name: 'new-session-expire',
            description: `The new TTL for a not-yet-authorized session in milliseconds.`,
            type: 'number',
            default: null,
          },
          {
            name: 'message-expire',
            description: `The new TTL for a message in milliseconds.`,
            type: 'number',
            default: null,
          },
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`All update parameters are optional. Only provided fields will be updated.\n`)

        console.log(
          `// Updates a 'httpbin' campaign description field:\n` +
            `.${spec.name} httpbin --description "My own campaign" -s f2c2ef66...\n`
        )

        console.log(
          `// Updates a 'httpbin' campaign message-expire field:\n` +
            `.${spec.name} httpbin --message-expire 7200000 -s f2c2ef66...\n`
        )
      },
      async (console, spec, args) => {
        await this.campaignService.update({
          campaignId: args._[0],
          description: args.description,
          sessionExpire: args.sessionExpire,
          newSessionExpire: args.newSessionExpire,
          messageExpire: args.messageExpire,
          lockSecret: args.lockSecret,
        })

        console.log(`Campaign updated!`)
      }
    )

    this.router.addCommand<DeleteCampaignArgs>(
      {
        name: 'campaign-delete',
        description: `Deletes the campaign by its ID.`,
        schemaName: 'console-delete-campaign-args',
        options: [
          {
            name: 'lock-secret',
            description: `The campaign lock secret.`,
            type: 'string',
            alias: 's',
          },
        ],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`// Deletes a 'httpbin' campaign:\n` + `.${spec.name} httpbin -s f2c2ef66...\n`)
      },
      async (console, spec, args) => {
        await this.campaignService.delete({
          campaignId: args._[0],
          lockSecret: args.lockSecret,
        })

        console.log(`Campaign deleted!`)
      }
    )

    this.router.addCommand<ListCampaignsArgs>(
      {
        name: 'campaign-list',
        description: `Lists all campaigns.`,
        schemaName: 'console-list-campaigns-args',
        options: [],
      },
      (console, spec) => {
        console.log(`Returns the array of campaign models.\n`)

        console.log(`The campaigns are ordered by creation time (oldest first).\n`)

        console.log(`// Lists all campaigns:\n` + `.${spec.name}\n`)
      },
      async (console) => {
        const campaigns = await this.campaignService.list()

        this.showCampaignCollection(console, campaigns)
      }
    )
  }

  private showCampaignModel(console: Console, campaign: FullCampaignModel) {
    console.table({
      campaignId: campaign.campaignId,
      mirrorDomain: campaign.mirrorDomain,
      //cryptSecret: campaign.cryptSecret,
      upgradeSessionPath: campaign.upgradeSessionPath,
      sessionCookieName: campaign.sessionCookieName,
      sessionCookieNames: campaign.sessionCookieNames.length,
      sessionExpire: campaign.sessionExpire,
      newSessionExpire: campaign.newSessionExpire,
      messageExpire: campaign.messageExpire,
      isLocked: campaign.isLocked,
      proxyCount: campaign.proxyCount,
      targetCount: campaign.targetCount,
      redirectorCount: campaign.redirectorCount,
      lureCount: campaign.lureCount,
      sessionCount: campaign.sessionCount,
      messageCount: campaign.messageCount,
      createdAt: campaign.createdAt.toISOString(),
    })

    if (campaign.description) {
      console.log(campaign.description)
    }
  }

  private showCampaignCollection(console: Console, campaigns: CampaignModel[]) {
    console.table(
      campaigns.map((campaign) => {
        return {
          campaignId: campaign.campaignId,
          mirrorDomain: campaign.mirrorDomain,
          isLocked: campaign.isLocked,
          sessionCount: campaign.sessionCount,
          messageCount: campaign.messageCount,
          createdAt: campaign.createdAt.toISOString(),
        }
      })
    )
  }
}

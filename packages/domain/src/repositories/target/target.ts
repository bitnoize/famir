import { RepositoryContainer } from '../../domain.js'
import { DisabledTarget, EnabledTarget, Target } from '../../models/index.js'

export interface TargetRepository {
  create(
    campaignId: string,
    id: string,
    isLanding: boolean,
    donorSecure: boolean,
    donorSub: string,
    donorDomain: string,
    donorPort: number,
    mirrorSecure: boolean,
    mirrorSub: string,
    mirrorDomain: string,
    mirrorPort: number,
    connectTimeout: number,
    timeout: number,
    mainPage: string,
    notFoundPage: string,
    faviconIco: string,
    robotsTxt: string,
    sitemapXml: string,
    successRedirectUrl: string,
    failureRedirectUrl: string
  ): Promise<RepositoryContainer<DisabledTarget>>

  read(campaignId: string, id: string): Promise<Target | null>

  readEnabled(campaignId: string, id: string): Promise<EnabledTarget | null>

  update(
    campaignId: string,
    id: string,
    connectTimeout: number | null | undefined,
    timeout: number | null | undefined,
    mainPage: string | null | undefined,
    notFoundPage: string | null | undefined,
    faviconIco: string | null | undefined,
    robotsTxt: string | null | undefined,
    sitemapXml: string | null | undefined,
    successRedirectUrl: string | null | undefined,
    failureRedirectUrl: string | null | undefined
  ): Promise<RepositoryContainer<DisabledTarget>>

  enable(campaignId: string, id: string): Promise<RepositoryContainer<EnabledTarget>>

  disable(campaignId: string, id: string): Promise<RepositoryContainer<DisabledTarget>>

  delete(campaignId: string, id: string): Promise<RepositoryContainer<DisabledTarget>>

  list(campaignId: string): Promise<Target[] | null>

  listEnabled(campaignId: string): Promise<EnabledTarget[] | null>
}

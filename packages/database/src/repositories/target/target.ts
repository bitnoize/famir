import { FullTargetModel, TargetModel } from '../../models/index.js'

export const TARGET_REPOSITORY = Symbol('TargetRepository')

export interface TargetRepository {
  create(
    campaignId: string,
    targetId: string,
    isLanding: boolean,
    donorSecure: boolean,
    donorSub: string,
    donorDomain: string,
    donorPort: number,
    mirrorSecure: boolean,
    mirrorSub: string,
    mirrorPort: number,
    connectTimeout: number,
    simpleTimeout: number,
    streamTimeout: number,
    headersSizeLimit: number,
    bodySizeLimit: number,
    mainPage: string,
    notFoundPage: string,
    faviconIco: string,
    robotsTxt: string,
    sitemapXml: string,
    lockSecret: string
  ): Promise<void>
  read(campaignId: string, targetId: string): Promise<FullTargetModel | null>
  find(mirrorHost: string): Promise<FullTargetModel | null>
  update(
    campaignId: string,
    targetId: string,
    connectTimeout: number | null | undefined,
    simpleTimeout: number | null | undefined,
    streamTimeout: number | null | undefined,
    headersSizeLimit: number | null | undefined,
    bodySizeLimit: number | null | undefined,
    mainPage: string | null | undefined,
    notFoundPage: string | null | undefined,
    faviconIco: string | null | undefined,
    robotsTxt: string | null | undefined,
    sitemapXml: string | null | undefined,
    lockSecret: string
  ): Promise<void>
  enable(campaignId: string, targetId: string, lockSecret: string): Promise<void>
  disable(campaignId: string, targetId: string, lockSecret: string): Promise<void>
  appendLabel(
    campaignId: string,
    targetId: string,
    label: string,
    lockSecret: string
  ): Promise<void>
  removeLabel(
    campaignId: string,
    targetId: string,
    label: string,
    lockSecret: string
  ): Promise<void>
  delete(campaignId: string, targetId: string, lockSecret: string): Promise<void>
  list(campaignId: string): Promise<TargetModel[] | null>
}

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
    ordinaryTimeout: number,
    streamingTimeout: number,
    requestBodyLimit: number,
    responseBodyLimit: number,
    mainPage: string,
    notFoundPage: string,
    faviconIco: string,
    robotsTxt: string,
    sitemapXml: string,
    lockCode: number
  ): Promise<void>
  read(campaignId: string, targetId: string): Promise<FullTargetModel | null>
  update(
    campaignId: string,
    targetId: string,
    connectTimeout: number | null | undefined,
    ordinaryTimeout: number | null | undefined,
    streamingTimeout: number | null | undefined,
    requestBodyLimit: number | null | undefined,
    responseBodyLimit: number | null | undefined,
    mainPage: string | null | undefined,
    notFoundPage: string | null | undefined,
    faviconIco: string | null | undefined,
    robotsTxt: string | null | undefined,
    sitemapXml: string | null | undefined,
    lockCode: number
  ): Promise<void>
  enable(campaignId: string, targetId: string, lockCode: number): Promise<void>
  disable(campaignId: string, targetId: string, lockCode: number): Promise<void>
  appendLabel(campaignId: string, targetId: string, label: string, lockCode: number): Promise<void>
  removeLabel(campaignId: string, targetId: string, label: string, lockCode: number): Promise<void>
  delete(campaignId: string, targetId: string, lockCode: number): Promise<void>
  list(campaignId: string): Promise<TargetModel[] | null>
}

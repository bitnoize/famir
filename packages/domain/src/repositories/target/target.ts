import { DisabledTargetModel, EnabledTargetModel, TargetModel } from '../../models/index.js'

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
  ): Promise<DisabledTargetModel>

  read(campaignId: string, id: string): Promise<TargetModel | null>

  readEnabled(campaignId: string, id: string): Promise<EnabledTargetModel | null>

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
  ): Promise<DisabledTargetModel>

  enable(campaignId: string, id: string): Promise<EnabledTargetModel>

  disable(campaignId: string, id: string): Promise<DisabledTargetModel>

  delete(campaignId: string, id: string): Promise<DisabledTargetModel>

  list(campaignId: string): Promise<TargetModel[] | null>

  listEnabled(campaignId: string): Promise<EnabledTargetModel[] | null>
}

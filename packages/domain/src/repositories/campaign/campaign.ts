import { CampaignModel, FullCampaignModel } from '../../models/index.js'

export const CAMPAIGN_REPOSITORY = Symbol('CampaignRepository')

export interface CampaignRepository {
  create(
    campaignId: string,
    mirrorDomain: string,
    description: string,
    landingUpgradePath: string,
    landingUpgradeParam: string,
    landingRedirectorParam: string,
    sessionCookieName: string,
    sessionExpire: number,
    newSessionExpire: number,
    messageExpire: number
  ): Promise<CampaignModel>
  read(campaignId: string): Promise<FullCampaignModel | null>
  update(
    campaignId: string,
    description: string | null | undefined,
    sessionExpire: number | null | undefined,
    newSessionExpire: number | null | undefined,
    messageExpire: number | null | undefined
  ): Promise<CampaignModel>
  delete(campaignId: string): Promise<CampaignModel>
  list(): Promise<CampaignModel[]>
}

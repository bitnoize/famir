import { CampaignModel, FullCampaignModel } from '../../models/index.js'

export const CAMPAIGN_REPOSITORY = Symbol('CampaignRepository')

export interface CampaignRepository {
  create(
    campaignId: string,
    mirrorDomain: string,
    description: string,
    lockTimeout: number,
    landingUpgradePath: string,
    sessionCookieName: string,
    sessionExpire: number,
    newSessionExpire: number,
    messageExpire: number
  ): Promise<void>
  read(campaignId: string): Promise<FullCampaignModel | null>
  lock(campaignId: string): Promise<string>
  unlock(campaignId: string, lockSecret: string): Promise<void>
  update(
    campaignId: string,
    description: string | null | undefined,
    sessionExpire: number | null | undefined,
    newSessionExpire: number | null | undefined,
    messageExpire: number | null | undefined,
    lockSecret: string
  ): Promise<void>
  delete(campaignId: string, lockSecret: string): Promise<void>
  list(): Promise<CampaignModel[]>
}

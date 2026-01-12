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
  ): Promise<number>
  read(campaignId: string): Promise<FullCampaignModel | null>
  lock(campaignId: string, isForce: boolean): Promise<number>
  unlock(campaignId: string, lockCode: number): Promise<void>
  update(
    campaignId: string,
    description: string | null | undefined,
    sessionExpire: number | null | undefined,
    newSessionExpire: number | null | undefined,
    messageExpire: number | null | undefined,
    lockCode: number
  ): Promise<void>
  delete(campaignId: string, lockCode: number): Promise<void>
  list(): Promise<CampaignModel[]>
}

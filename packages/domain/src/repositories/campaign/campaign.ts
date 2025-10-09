import { CampaignModel } from '../../models/index.js'

export interface CreateCampaignModel {
  campaignId: string
  mirrorDomain: string
  description: string
  landingSecret: string | null | undefined
  landingAuthPath: string
  landingAuthParam: string
  landingLureParam: string
  sessionCookieName: string
  sessionExpire: number
  newSessionExpire: number
  messageExpire: number
}

export interface ReadCampaignModel {
  campaignId: string
}

export interface UpdateCampaignModel {
  campaignId: string
  description: string | null | undefined
  sessionExpire: number | null | undefined
  newSessionExpire: number | null | undefined
  messageExpire: number | null | undefined
}

export interface DeleteCampaignModel {
  campaignId: string
}

export interface CampaignRepository {
  create(data: CreateCampaignModel): Promise<CampaignModel>
  read(data: ReadCampaignModel): Promise<CampaignModel | null>
  update(data: UpdateCampaignModel): Promise<CampaignModel>
  delete(data: DeleteCampaignModel): Promise<CampaignModel>
  list(): Promise<CampaignModel[]>
}

export const CAMPAIGN_REPOSITORY = Symbol('CampaignRepository')

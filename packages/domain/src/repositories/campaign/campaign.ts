import { CampaignModel } from '../../models/index.js'

export interface CreateCampaignData {
  campaignId: string
  mirrorDomain: string
  description: string
  landingAuthPath: string
  landingAuthParam: string
  landingLureParam: string
  sessionCookieName: string
  sessionExpire: number
  newSessionExpire: number
  messageExpire: number
}

export interface ReadCampaignData {
  campaignId: string
}

export interface UpdateCampaignData {
  campaignId: string
  description: string | null | undefined
  sessionExpire: number | null | undefined
  newSessionExpire: number | null | undefined
  messageExpire: number | null | undefined
}

export interface DeleteCampaignData {
  campaignId: string
}

export interface CampaignRepository {
  createCampaign(data: CreateCampaignData): Promise<CampaignModel>
  readCampaign(data: ReadCampaignData): Promise<CampaignModel | null>
  updateCampaign(data: UpdateCampaignData): Promise<CampaignModel>
  deleteCampaign(data: DeleteCampaignData): Promise<CampaignModel>
  listCampaigns(): Promise<CampaignModel[]>
}

export const CAMPAIGN_REPOSITORY = Symbol('CampaignRepository')

import { CampaignModel } from '../../models/index.js'

export interface CreateCampaignData {
  id: string
  description: string | null | undefined
  landingSecret: string | null | undefined
  landingAuthPath: string | null | undefined
  landingAuthParam: string | null | undefined
  landingLureParam: string | null | undefined
  sessionCookieName: string | null | undefined
  sessionExpire: number | null | undefined
  newSessionExpire: number | null | undefined
  messageExpire: number | null | undefined
}

export interface ReadCampaignData {
  id: string
}

export interface UpdateCampaignData {
  id: string
  description: string | null | undefined
  sessionExpire: number | null | undefined
  newSessionExpire: number | null | undefined
  messageExpire: number | null | undefined
}

export interface DeleteCampaignData {
  id: string
}

export interface CampaignRepository {
  create(data: CreateCampaignData): Promise<CampaignModel>
  read(data: ReadCampaignData): Promise<CampaignModel | null>
  update(data: UpdateCampaignData): Promise<CampaignModel>
  delete(data: DeleteCampaignData): Promise<CampaignModel>
  list(): Promise<CampaignModel[]>
}

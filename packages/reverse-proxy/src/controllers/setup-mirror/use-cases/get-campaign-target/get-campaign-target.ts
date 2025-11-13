import { CampaignModel, EnabledTargetModel } from '@famir/domain'

export interface GetCampaignTargetData {
  campaignId: string
  targetId: string
}

export interface GetCampaignTargetReply {
  campaign: CampaignModel
  target: EnabledTargetModel
}

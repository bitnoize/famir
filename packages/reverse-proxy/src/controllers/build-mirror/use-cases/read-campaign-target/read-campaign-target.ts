import { CampaignModel, EnabledTargetModel } from '@famir/domain'

export interface ReadCampaignTargetData {
  campaignId: string
  targetId: string
}

export interface ReadCampaignTargetResult {
  campaign: CampaignModel
  target: EnabledTargetModel
}

import { CampaignModel, TargetModel } from '@famir/domain'

export interface ConfigurationData {
  campaignId: string
  targetId: string
}

export interface ConfigurationResult {
  campaign: CampaignModel
  target: TargetModel
}

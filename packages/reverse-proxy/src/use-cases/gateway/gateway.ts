import { CampaignModel, EnabledTargetModel } from '@famir/domain'

export interface GatewayData {
  campaignId: string
  targetId: string
}

export interface GatewayResult {
  campaign: CampaignModel
  target: EnabledTargetModel
}
